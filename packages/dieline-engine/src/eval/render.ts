import { compile, evalCondition, evalNumber, ExprError, type Ref } from "../expr/expr";
import { bleedOutline, trimFoldsAtHoles } from "../geometry/bleed";
import {
  distance,
  IDENTITY,
  pathsBounds,
  placePaths,
  placePoint,
  type Placement,
} from "../geometry/math";
import { buildShape, GeometryError, type Evaluate } from "../geometry/shapes";
import type { Bounds, Path, Prim, Pt } from "../geometry/types";
import type {
  ComponentDef,
  DielineDocument,
  EdgeFeature,
  Expr,
  GroupNode,
  InstanceNode,
  LineType,
  Node,
  NodeKind,
  PanelsNode,
  Rule,
} from "../spec/types";
import { Diagnostics, type Diagnostic } from "./diagnostics";
import { applyModifiers, combineChildren } from "./modifiers";
import { lookupRef } from "./refs";
import { LIBRARY } from "../library/components";
import { buildScope, messageOf, type Builtins, type Scope } from "./scope";

export type RenderInputs = {
  /** Final manufacturing dimensions; see `resolveDimensions` for inner/outer sizes. */
  width: number;
  length: number;
  height: number;
  thickness: number;
  /** Values for the document's params, by name. Missing ones use their default. */
  params?: Record<string, number>;
  /** Bleed around the cut outline, in mm. 0 or missing means none. */
  bleed?: number;
};

export type NodeInfo = {
  id: string;
  name: string;
  kind: NodeKind;
  parentId: string | null;
  /** False when hidden by its flag, a rule, or a hidden ancestor. */
  visible: boolean;
  /** The node could not be built; its diagnostics say why. */
  failed: boolean;
  /** World bounds of the node's own geometry. */
  bounds: Bounds | null;
  /** Named points in world coordinates, usable as `@name.anchor.x`. */
  anchors: Record<string, Pt>;
  /** Named measurements, usable as `@name.width`. */
  scalars: Record<string, number>;
  /** The local point that sits at the node's `x`/`y`: its reference point. */
  origin: Pt;
  /**
   * The node's own evaluated transform, relative to its parent. The editor uses
   * it (with the parents') to map pointer movement into the node's frame.
   */
  placement: Placement;
};

export type RulerInfo = {
  id: string;
  name: string;
  from: Pt;
  to: Pt;
  offset: number;
  value: number;
  /** The box dimension this ruler measures, when it measures one (`typedRulers`). */
  dimension?: "width" | "length" | "height";
};

export type RenderResult = {
  /** Visible geometry in world coordinates, tagged by node and line type. */
  paths: Path[];
  /** Bleed outline around the cut lines, when bleed was requested. */
  bleed: Prim[];
  /** Length of fold line (mm) removed because a window crosses it. */
  foldsCut: number;
  /**
   * The removed pieces. The 3D model still folds along the whole line (the
   * panels either side are hinged there), so the fold export puts them back.
   */
  foldsInHoles: Path[];
  nodes: Record<string, NodeInfo>;
  rulers: RulerInfo[];
  scope: Scope;
  diagnostics: Diagnostic[];
  /** Bounds of everything that would be produced (guides excluded). */
  bounds: Bounds | null;
};

/** Components may place components, but not endlessly. */
const MAX_COMPONENT_DEPTH = 8;

const BOX_ANCHORS = (b: Bounds): Record<string, Pt> => {
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return {
    bottomLeft: [b.minX, b.minY],
    bottom: [cx, b.minY],
    bottomRight: [b.maxX, b.minY],
    right: [b.maxX, cy],
    topRight: [b.maxX, b.maxY],
    top: [cx, b.maxY],
    topLeft: [b.minX, b.maxY],
    left: [b.minX, cy],
    center: [cx, cy],
  };
};

/** A panel's corners, edge middles and centre, prefixed with its name. */
function panelAnchors(name: string, x0: number, x1: number, h: number): Record<string, Pt> {
  return Object.fromEntries(
    Object.entries(BOX_ANCHORS({ minX: x0, minY: 0, maxX: x1, maxY: h })).map(([k, p]) => [`${name}.${k}`, p]),
  );
}

/** An error that knows which input field caused it. */
class FieldError extends Error {
  constructor(
    message: string,
    readonly field: string,
  ) {
    super(message);
  }
}

type Env = {
  builtins: Builtins;
  components: Map<string, ComponentDef>;
  diagnostics: Diagnostics;
};

/** Set when a context renders the inside of a component instance. */
type Owner = { instanceId: string; componentName: string; field: string };

/** A node's geometry in its parent's frame, with its own transform applied. */
type Built = {
  paths: Path[];
  anchors: Record<string, Pt>;
  scalars: Record<string, number>;
};

type Entry = { node: Node; parent: GroupNode | null };

/**
 * Renders one node tree against one scope: the document itself, or the inside of
 * a component instance.
 *
 * Nodes are built lazily and memoised, so a reference such as `@lid.top.y` simply
 * builds `lid` first. A node that is reached again while it is still being built
 * is a circular reference.
 */
class Context {
  private readonly byName = new Map<string, Entry>();
  private readonly byId = new Map<string, Entry>();
  private readonly built = new Map<string, Built | null>();
  private readonly building = new Set<string>();
  private readonly placements = new Map<string, Placement>();
  private readonly origins = new Map<string, Pt>();
  private readonly placing = new Set<string>();
  private readonly hidden = new Map<string, boolean>();

  constructor(
    private readonly roots: readonly Node[],
    private readonly scope: Scope,
    private readonly env: Env,
    private readonly depth: number,
    private readonly owner: Owner | null,
  ) {
    const index = (nodes: readonly Node[], parent: GroupNode | null) => {
      for (const node of nodes) {
        const entry = { node, parent };
        this.byId.set(node.id, entry);

        if (this.byName.has(node.name)) {
          this.error(node.id, "name", `The name "${node.name}" is already used; references reach the first one`);
        } else {
          this.byName.set(node.name, entry);
        }

        if (node.kind === "group") index(node.children, node);
      }
    };
    index(roots, null);
  }

  //! Output -------------------------------------------------------------------

  /** Geometry of every visible root node, in this context's frame. */
  paths(): Path[] {
    const out: Path[] = [];
    for (const node of this.roots) {
      if (this.isHidden(node)) continue;
      const built = this.build(node);
      if (built) out.push(...built.paths);
    }
    return out;
  }

  /** Information about every node, for the editor. */
  infos(): Record<string, NodeInfo> {
    const out: Record<string, NodeInfo> = {};

    const visit = (nodes: readonly Node[], parent: GroupNode | null, parentVisible: boolean) => {
      for (const node of nodes) {
        const visible = parentVisible && !this.isHidden(node);
        const world = this.world(node);

        let placement = IDENTITY;
        try {
          placement = this.placement(node);
        } catch {
          // Already reported when the node was built.
        }

        out[node.id] = {
          id: node.id,
          name: node.name,
          kind: node.kind,
          parentId: parent?.id ?? null,
          visible,
          failed: world === null,
          bounds: world ? pathsBounds(world.paths) : null,
          anchors: world?.anchors ?? {},
          scalars: world?.scalars ?? {},
          origin: this.origins.get(node.id) ?? [0, 0],
          placement,
        };

        if (node.kind === "group") visit(node.children, node, visible);
      }
    };

    visit(this.roots, null, true);
    return out;
  }

  //! Expressions --------------------------------------------------------------

  /** Evaluates an expression in this context, resolving `@` references. */
  num(expr: Expr): number {
    const compiled = compile(expr);
    return evalNumber(compiled, this.scopeFor(compiled.refs));
  }

  private condition(expr: Expr): boolean {
    const compiled = compile(expr);
    return evalCondition(compiled, this.scopeFor(compiled.refs));
  }

  private scopeFor(refs: Ref[]): Record<string, unknown> {
    if (refs.length === 0) return this.scope;

    const values: Record<string, number> = {};
    for (const ref of refs) values[ref.symbol] = this.resolve(ref);
    return { ...this.scope, ...values };
  }

  /** The value of `@node.anchor.x` / `@node.scalar`. */
  private resolve(ref: Ref): number {
    const entry = this.byName.get(ref.node);
    if (!entry) throw new ExprError(`No shape is named "${ref.node}"`);

    const world = this.world(entry.node);
    if (!world) throw new ExprError(`"${ref.node}" has an error`);

    return lookupRef(world, ref.node, ref.path);
  }

  /** An evaluator whose failures carry the field that failed. */
  private evaluator(): Evaluate {
    const num = (expr: Expr, field: string) => {
      try {
        return this.num(expr);
      } catch (error) {
        throw new FieldError(messageOf(error), field);
      }
    };
    return {
      num,
      opt: (expr, field, fallback) =>
        expr === undefined || expr.trim() === "" ? fallback : num(expr, field),
    };
  }

  //! Visibility ---------------------------------------------------------------

  /** The node's own flag, then its rules in order; the last matching rule wins. */
  isHidden(node: { id: string; hidden?: boolean; rules?: Rule[] }, ruler = false): boolean {
    const cached = this.hidden.get(node.id);
    if (cached !== undefined) return cached;

    let hidden = !!node.hidden;
    node.rules?.forEach((rule, i) => {
      try {
        if (this.condition(rule.when)) hidden = rule.action === "hide";
      } catch (error) {
        // A broken rule is skipped rather than taking the node down with it.
        const field = `rules.${i}.when`;
        if (ruler) {
          this.env.diagnostics.warn({ type: "ruler", id: node.id, field }, messageOf(error));
        } else {
          this.report("warning", node.id, field, messageOf(error));
        }
      }
    });

    this.hidden.set(node.id, hidden);
    return hidden;
  }

  //! Building -----------------------------------------------------------------

  private build(node: Node): Built | null {
    if (this.built.has(node.id)) return this.built.get(node.id)!;

    if (this.building.has(node.id)) {
      throw new ExprError(`Circular reference through "${node.name}"`);
    }

    this.building.add(node.id);
    let result: Built | null = null;

    try {
      result = this.buildUncached(node);
    } catch (error) {
      const field = error instanceof FieldError || error instanceof GeometryError ? error.field : undefined;
      this.error(node.id, field, messageOf(error));
    } finally {
      this.building.delete(node.id);
    }

    this.built.set(node.id, result);
    return result;
  }

  private buildUncached(node: Node): Built {
    const ev = this.evaluator();

    let paths: Path[];
    let anchors: Record<string, Pt> = {};
    let scalars: Record<string, number> = {};

    switch (node.kind) {
      case "group":
        paths = this.buildGroup(node);
        break;

      case "instance":
      case "panels": {
        const built = node.kind === "instance" ? this.buildInstance(node) : this.buildPanels(node);
        paths = built.paths;
        anchors = built.anchors;
        scalars = built.scalars;
        break;
      }

      default: {
        const shape = buildShape(node, ev);
        paths = shape.parts.map(({ prim, lineType }) => ({ ...prim, lineType, nodeId: node.id }));
        anchors = shape.anchors;
        scalars = shape.scalars;
      }
    }

    paths = applyModifiers(paths, node.modifiers, ev);

    // Box anchors come from what the node finally draws; a shape's own named
    // points (a path's vertices, an arc's ends) take precedence over them.
    const local = pathsBounds(paths);
    if (local) {
      anchors = { ...BOX_ANCHORS(local), ...anchors };
      scalars = { width: local.maxX - local.minX, height: local.maxY - local.minY, ...scalars };
    }

    let placement = this.placement(node);
    // A reference point needs the node's size, so it is applied here, once the
    // geometry exists. Groups keep their frame: their children are placed through
    // it, possibly before the group is built.
    const origin = node.transform?.origin;
    if (origin && local && node.kind !== "group") {
      const point = BOX_ANCHORS(local)[origin]!;
      const [x, y] = placePoint([-point[0], -point[1]], placement);
      placement = { ...placement, x, y };
      this.placements.set(node.id, placement);
      this.origins.set(node.id, point);
    }

    return {
      paths: placePaths(paths, placement),
      anchors: Object.fromEntries(
        Object.entries(anchors).map(([key, p]) => [key, placePoint(p, placement)]),
      ),
      scalars,
    };
  }

  private buildGroup(group: GroupNode): Path[] {
    const operands: Path[][] = [];

    for (const child of group.children) {
      const built = this.build(child);
      // A broken child has its own diagnostic; the group still renders the rest.
      if (!built || this.isHidden(child)) continue;
      operands.push(built.paths);
    }

    return group.combine
      ? combineChildren(operands, group.combine, group.id)
      : operands.flat();
  }

  private buildInstance(node: InstanceNode): Built {
    return this.buildComponent(node.id, node.component, node.args, "", {});
  }

  /**
   * Builds a component for a node: a placed instance, or an edge feature of a box
   * body. `fieldPrefix` locates the arguments in the node for diagnostics
   * (`args.depth`, `panels.2.top.args.depth`), and `extra` adds built-ins such as
   * `edge`. Paths come back tagged with the owning node's id.
   */
  private buildComponent(
    nodeId: string,
    componentId: string,
    args: Record<string, Expr>,
    fieldPrefix: string,
    extra: Record<string, number>,
  ): Built {
    const def = this.env.components.get(componentId);
    if (!def) throw new FieldError(`Component "${componentId}" does not exist`, `${fieldPrefix}component`);
    if (this.depth >= MAX_COMPONENT_DEPTH) {
      throw new FieldError("Components are nested too deeply (or place themselves)", `${fieldPrefix}component`);
    }

    const known = new Set(def.params.map((p) => p.name));
    const overrides: Record<string, number> = {};
    const ev = this.evaluator();

    for (const [name, expr] of Object.entries(args)) {
      if (!known.has(name)) {
        this.report("warning", nodeId, `${fieldPrefix}args.${name}`, `${def.name} has no parameter "${name}"`);
        continue;
      }
      if (expr.trim() !== "") overrides[name] = ev.num(expr, `${fieldPrefix}args.${name}`);
    }

    // Problems inside the component are reported on the node, since that is
    // what the designer can see and click.
    const inner = new Diagnostics();
    const scope = buildScope(this.env.builtins, def.params, def.variables, overrides, inner, def.name, extra);
    for (const d of inner.list) {
      const field = d.target.type === "param" ? `${fieldPrefix}args.${d.target.name}` : `${fieldPrefix}component`;
      this.report(d.severity, nodeId, field, `${def.name}: ${d.message}`);
    }

    const context = new Context(def.nodes, scope, this.env, this.depth + 1, {
      instanceId: nodeId,
      componentName: def.name,
      field: `${fieldPrefix}component`,
    });

    const paths = context.paths().map((p) => ({ ...p, nodeId }));

    const anchors: Record<string, Pt> = {};
    for (const anchor of def.anchors ?? []) {
      try {
        anchors[anchor.name] = [context.num(anchor.at.x), context.num(anchor.at.y)];
      } catch (error) {
        this.report("error", nodeId, `${fieldPrefix}component`, `${def.name} › anchor ${anchor.name}: ${messageOf(error)}`);
      }
    }

    const scalars: Record<string, number> = {};
    for (const param of def.params) {
      const value = scope[param.name];
      if (value !== undefined) scalars[param.name] = value;
    }

    return { paths, anchors, scalars };
  }

  //! Box bodies ---------------------------------------------------------------

  /**
   * Panels side by side with folds between them. Each edge is either cut or, when
   * it carries a feature, its hinge plus the feature's own geometry. Every panel
   * offers its corners as anchors (`front.topLeft`) and its width as a scalar.
   */
  private buildPanels(node: PanelsNode): Built {
    const ev = this.evaluator();
    const height = ev.num(node.height, "height");
    if (!(height > 0)) throw new GeometryError("Height must be greater than 0", "height");

    const seen = new Set<string>();
    let x = 0;
    const spans = node.panels.map((panel, i) => {
      if (seen.has(panel.name)) throw new GeometryError(`Two panels are named "${panel.name}"`, `panels.${i}.name`);
      seen.add(panel.name);
      const w = ev.num(panel.width, `panels.${i}.width`);
      if (!(w > 0)) throw new GeometryError("Width must be greater than 0", `panels.${i}.width`);
      const inset = (side: "left" | "right") => {
        const field = `panels.${i}.inset.${side}`;
        const value = ev.opt(panel.inset?.[side], field, 0);
        if (value < 0 || value >= height / 2) throw new GeometryError("Inset must be at least 0 and less than half the height", field);
        return value;
      };
      const span = { x0: x, x1: x + w, w, il: inset("left"), ir: inset("right") };
      x += w;
      return span;
    });
    const total = x;

    const paths: Path[] = [];
    const anchors: Record<string, Pt> = {};
    const scalars: Record<string, number> = { bodyWidth: total, bodyHeight: height };
    const line = (a: Pt, b: Pt, lineType: LineType) => paths.push({ kind: "line", a, b, lineType, nodeId: node.id });

    // Folds between neighbouring panels.
    const stop = Math.max(0.3, this.env.builtins.thickness) / 2;
    const relief = (i: number, side: "top" | "bottom") =>
      [i - 1, i].some((j) => {
        const feature = node.panels[j]?.[side];
        return !!feature && !!this.env.components.get(feature.component)?.edge?.relief;
      })
        ? stop
        : 0;
    // How far the body's outer edge stops short of a corner, to meet the hole of
    // the flap there. Top edges start at the left, bottom edges at the right, and
    // a flip swaps them.
    const outerStop = (i: number, side: "top" | "bottom", left: boolean) => {
      const feature = node.panels[i]?.[side];
      const straight = feature && this.env.components.get(feature.component)?.edge?.straight;
      if (!straight) return 0;
      const atStart = (side === "top") === left ? !feature.flip : !!feature.flip;
      return straight === "both" || straight === (atStart ? "start" : "end") ? stop : 0;
    };
    // A fold runs between the shorter of the two panels' edges where they meet.
    const insetAt = (i: number) => Math.max(spans[i - 1]?.ir ?? 0, spans[i]?.il ?? 0);
    spans.forEach((span, i) => {
      if (i === 0) return;
      const inset = insetAt(i);
      line([span.x0, Math.max(inset, relief(i, "bottom"))], [span.x0, height - Math.max(inset, relief(i, "top"))], node.fold ?? "crease");
    });

    const edge = (
      feature: EdgeFeature | undefined,
      a: Pt,
      b: Pt,
      frame: Placement,
      length: number,
      field: string,
      anchorPrefix: string,
      // Whether the panel edge next to each end of this one (along the fold) is a
      // plain cut a flap may stand on. In the feature's own frame, after a flip.
      free: { start: boolean; end: boolean } = { start: false, end: false },
      // Whether the neighbouring panel carries a feature on the same edge (a lid beside a dust flap).
      next: { start: boolean; end: boolean } = { start: false, end: false },
      // A cut edge's ends pulled in along it, in the feature's frame before a flip.
      inset: { start: number; end: number } = { start: 0, end: 0 },
    ) => {
      if (!feature) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        line([a[0] + (dx / len) * inset.start, a[1] + (dy / len) * inset.start], [b[0] - (dx / len) * inset.end, b[1] - (dy / len) * inset.end], "cut");
        return;
      }

      const def = this.env.components.get(feature.component);
      const hinge = feature.hinge ?? def?.edge?.hinge ?? "crease";

      try {
        const built = this.buildComponent(node.id, feature.component, feature.args ?? {}, `${field}.`, {
          edge: length,
          startFree: (feature.flip ? free.end : free.start) ? 1 : 0,
          endFree: (feature.flip ? free.start : free.end) ? 1 : 0,
          startNext: (feature.flip ? next.end : next.start) ? 1 : 0,
          endNext: (feature.flip ? next.start : next.end) ? 1 : 0,
          // How far the edge's ends are pulled in (a shortened inner wall's outer edge).
          startInset: feature.flip ? inset.end : inset.start,
          endInset: feature.flip ? inset.start : inset.end,
        });
        // Flipping mirrors the feature end to end about the middle of its edge.
        const flip: Placement = feature.flip ? { ...IDENTITY, mirrorX: true, x: length } : IDENTITY;
        paths.push(...placePaths(placePaths(built.paths, flip), frame));
        for (const [name, p] of Object.entries(built.anchors)) {
          anchors[`${anchorPrefix}.${name}`] = placePoint(placePoint(p, flip), frame);
        }
        if (hinge !== "none") line(a, b, hinge);
      } catch (error) {
        // A broken feature leaves a plain cut edge, so the rest still reads.
        const f = error instanceof FieldError || error instanceof GeometryError ? error.field : undefined;
        this.error(node.id, f ?? `${field}.component`, messageOf(error));
        line(a, b, "cut");
      }
    };

    node.panels.forEach((panel, i) => {
      const { x0, x1, w, il, ir } = spans[i]!;
      Object.assign(anchors, panelAnchors(panel.name, x0, x1, height));
      scalars[`${panel.name}.width`] = w;

      // Each edge frame puts the hinge on +x and the feature towards +y, outward.
      // A neighbour's edge with no feature is a plain cut, and so is the end of the body.
      const plain = (j: number, side: "top" | "bottom") => !node.panels[j]?.[side];
      const featured = (j: number, side: "top" | "bottom") => j >= 0 && j < node.panels.length && !!node.panels[j]![side];
      // A feature needs a straight edge square to the folds: a sloping one has none.
      if (il !== ir) {
        for (const side of ["top", "bottom"] as const) {
          if (panel[side]) this.error(node.id, `panels.${i}.${side}.component`, "A panel with different insets at its two sides has a sloping edge and cannot carry a part");
        }
      }
      const sloped = il !== ir;
      // Top edges run left to right, bottom edges right to left.
      edge(sloped ? undefined : panel.top, [x0, height - il], [x1, height - ir], { ...IDENTITY, x: x0, y: height - il }, w, `panels.${i}.top`, `${panel.name}.top`, {
        start: plain(i - 1, "top"),
        end: plain(i + 1, "top"),
      }, { start: featured(i - 1, "top"), end: featured(i + 1, "top") });
      edge(sloped ? undefined : panel.bottom, [x1, ir], [x0, il], { ...IDENTITY, x: x1, y: ir, rotate: 180 }, w, `panels.${i}.bottom`, `${panel.name}.bottom`, {
        start: plain(i + 1, "bottom"),
        end: plain(i - 1, "bottom"),
      }, { start: featured(i + 1, "bottom"), end: featured(i - 1, "bottom") });
    });

    const first = node.panels[0]?.name ?? "first";
    const last = node.panels[node.panels.length - 1]?.name ?? "last";
    const lastIndex = node.panels.length - 1;
    const lb = outerStop(0, "bottom", true);
    const lt = outerStop(0, "top", true);
    const rb = outerStop(lastIndex, "bottom", false);
    const rt = outerStop(lastIndex, "top", false);
    // An inset outer panel's side edge keeps its frame on the body's corners, so a
    // part on it (the keyboard box's tabs) stays measured from them; its ends are
    // pulled in to the shortened top and bottom.
    const firstInset = spans[0]?.il ?? 0;
    const lastInset = spans[lastIndex]?.ir ?? 0;
    edge(node.left, [0, lb], [0, height - lt], { ...IDENTITY, y: lb, rotate: 90 }, height - lb - lt, "left", `${first}.left`, undefined, undefined, {
      start: Math.max(0, firstInset - lb),
      end: Math.max(0, firstInset - lt),
    });
    edge(node.right, [total, height - rt], [total, rb], { ...IDENTITY, x: total, y: height - rt, rotate: -90 }, height - rb - rt, "right", `${last}.right`, undefined, undefined, {
      start: Math.max(0, lastInset - rt),
      end: Math.max(0, lastInset - rb),
    });

    return { paths, anchors, scalars };
  }

  /** A node's own transform, evaluated once. */
  private placement(node: Node): Placement {
    const cached = this.placements.get(node.id);
    if (cached) return cached;

    const t = node.transform;
    if (!t) return IDENTITY;

    if (this.placing.has(node.id)) {
      throw new ExprError(`"${node.name}" is placed relative to itself`);
    }

    this.placing.add(node.id);
    try {
      const ev = this.evaluator();
      const placement: Placement = {
        x: ev.opt(t.x, "transform.x", 0),
        y: ev.opt(t.y, "transform.y", 0),
        rotate: ev.opt(t.rotate, "transform.rotate", 0),
        mirrorX: !!t.mirrorX,
        mirrorY: !!t.mirrorY,
      };
      this.placements.set(node.id, placement);
      return placement;
    } finally {
      this.placing.delete(node.id);
    }
  }

  /** A node's geometry and anchors in this context's frame (through its groups). */
  private world(node: Node): Built | null {
    const built = this.build(node);
    if (!built) return null;

    let paths = built.paths;
    let anchors = built.anchors;

    for (let parent = this.byId.get(node.id)?.parent ?? null; parent; parent = this.byId.get(parent.id)?.parent ?? null) {
      // A group whose own placement fails reports it when it is built; anything
      // inside it simply has no world position.
      let placement: Placement;
      try {
        placement = this.placement(parent);
      } catch {
        return null;
      }
      paths = placePaths(paths, placement);
      anchors = Object.fromEntries(
        Object.entries(anchors).map(([key, p]) => [key, placePoint(p, placement)]),
      );
    }

    return { paths, anchors, scalars: built.scalars };
  }

  //! Rulers -------------------------------------------------------------------

  rulers(list: DielineDocument["rulers"]): RulerInfo[] {
    const out: RulerInfo[] = [];

    for (const ruler of list) {
      if (this.isHidden(ruler, true)) continue;

      let field = "from.x";
      try {
        const at = (expr: Expr, name: string) => {
          field = name;
          return this.num(expr);
        };
        const from: Pt = [at(ruler.from.x, "from.x"), at(ruler.from.y, "from.y")];
        const to: Pt = [at(ruler.to.x, "to.x"), at(ruler.to.y, "to.y")];
        const offset = at(ruler.offset, "offset");
        out.push({ id: ruler.id, name: ruler.name, from, to, offset, value: distance(from, to) });
      } catch (error) {
        this.env.diagnostics.error({ type: "ruler", id: ruler.id, field }, messageOf(error));
      }
    }

    return out;
  }

  //! Reporting ----------------------------------------------------------------

  private error(nodeId: string, field: string | undefined, message: string) {
    this.report("error", nodeId, field, message);
  }

  private report(
    severity: Diagnostic["severity"],
    nodeId: string,
    field: string | undefined,
    message: string,
  ) {
    if (this.owner) {
      // Inside a component: pin it on the instance the designer placed.
      const name = this.byId.get(nodeId)?.node.name ?? nodeId;
      const target = { type: "node" as const, id: this.owner.instanceId, field: this.owner.field };
      const text = `${this.owner.componentName} › ${name}: ${message}`;
      if (severity === "error") this.env.diagnostics.error(target, text);
      else this.env.diagnostics.warn(target, text);
      return;
    }

    const target = { type: "node" as const, id: nodeId, ...(field ? { field } : {}) };
    if (severity === "error") this.env.diagnostics.error(target, message);
    else this.env.diagnostics.warn(target, message);
  }
}

/**
 * Renders a document for one set of dimensions. Pure and total: the same input
 * always gives the same result, and problems come back as diagnostics instead of
 * exceptions.
 */
export function render(doc: DielineDocument, inputs: RenderInputs): RenderResult {
  const diagnostics = new Diagnostics();
  const builtins: Builtins = {
    width: inputs.width,
    length: inputs.length,
    height: inputs.height,
    thickness: inputs.thickness,
  };

  const scope = buildScope(builtins, doc.params, doc.variables, inputs.params, diagnostics);

  const env: Env = {
    builtins,
    // The built-in library first, so a document's own component can shadow one.
    components: new Map([...LIBRARY, ...doc.components].map((c) => [c.id, c])),
    diagnostics,
  };

  const context = new Context(doc.nodes, scope, env, 0, null);
  // A window cut across a fold interrupts it.
  const { paths, trimmed: foldsCut, removed: foldsInHoles } = trimFoldsAtHoles(context.paths());
  const nodes = context.infos();
  const rulers = context.rulers(doc.rulers);

  const production = paths.filter((p) => p.lineType !== "guide" && p.lineType !== "bend");

  let bleed: Prim[] = [];
  if (inputs.bleed && inputs.bleed > 0) {
    try {
      bleed = bleedOutline(
        production.filter((p) => p.lineType === "cut"),
        inputs.bleed,
      );
    } catch (error) {
      diagnostics.warn({ type: "document" }, `Bleed could not be built: ${messageOf(error)}`);
    }
  }

  return {
    paths,
    bleed,
    foldsCut,
    foldsInHoles,
    nodes,
    rulers,
    scope,
    diagnostics: diagnostics.list,
    bounds: pathsBounds(production),
  };
}
