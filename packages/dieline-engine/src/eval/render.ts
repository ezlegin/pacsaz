import { compile, evalCondition, evalNumber, ExprError, type Ref } from "../expr/expr";
import { offsetOf } from "../geometry/makerjs";
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
  Expr,
  GroupNode,
  InstanceNode,
  Node,
  NodeKind,
  Rule,
} from "../spec/types";
import { Diagnostics, type Diagnostic } from "./diagnostics";
import { applyModifiers, combineChildren } from "./modifiers";
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
};

export type RenderResult = {
  /** Visible geometry in world coordinates, tagged by node and line type. */
  paths: Path[];
  /** Bleed outline around the cut lines, when bleed was requested. */
  bleed: Prim[];
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
type Owner = { instanceId: string; componentName: string };

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

    const [first, second, ...extra] = ref.path;
    if (!first || extra.length > 0) {
      throw new ExprError(`Write @${ref.node}.width or @${ref.node}.anchor.x`);
    }

    if (second === undefined) {
      const scalar = world.scalars[first];
      if (scalar !== undefined) return scalar;
      if (world.anchors[first]) {
        throw new ExprError(`@${ref.node}.${first} is a point; add .x or .y`);
      }
      throw new ExprError(`"${ref.node}" has no "${first}"`);
    }

    const anchor = world.anchors[first];
    if (!anchor) throw new ExprError(`"${ref.node}" has no point "${first}"`);
    if (second === "x") return anchor[0];
    if (second === "y") return anchor[1];
    throw new ExprError(`Use .x or .y after @${ref.node}.${first}`);
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

      case "instance": {
        const instance = this.buildInstance(node);
        paths = instance.paths;
        anchors = instance.anchors;
        scalars = instance.scalars;
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

    const placement = this.placement(node);
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
    const def = this.env.components.get(node.component);
    if (!def) throw new FieldError(`Component "${node.component}" does not exist`, "component");
    if (this.depth >= MAX_COMPONENT_DEPTH) {
      throw new FieldError("Components are nested too deeply (or place themselves)", "component");
    }

    const known = new Set(def.params.map((p) => p.name));
    const overrides: Record<string, number> = {};
    const ev = this.evaluator();

    for (const [name, expr] of Object.entries(node.args)) {
      if (!known.has(name)) {
        this.report("warning", node.id, `args.${name}`, `${def.name} has no parameter "${name}"`);
        continue;
      }
      if (expr.trim() !== "") overrides[name] = ev.num(expr, `args.${name}`);
    }

    // Problems inside the component are reported on the instance, since that is
    // what the designer can see and click.
    const inner = new Diagnostics();
    const scope = buildScope(this.env.builtins, def.params, def.variables, overrides, inner, def.name);
    for (const d of inner.list) {
      const field = d.target.type === "param" ? `args.${d.target.name}` : "component";
      this.report(d.severity, node.id, field, `${def.name}: ${d.message}`);
    }

    const context = new Context(def.nodes, scope, this.env, this.depth + 1, {
      instanceId: node.id,
      componentName: def.name,
    });

    const paths = context.paths().map((p) => ({ ...p, nodeId: node.id }));

    const anchors: Record<string, Pt> = {};
    for (const anchor of def.anchors ?? []) {
      try {
        anchors[anchor.name] = [context.num(anchor.at.x), context.num(anchor.at.y)];
      } catch (error) {
        this.report("error", node.id, "component", `${def.name} › anchor ${anchor.name}: ${messageOf(error)}`);
      }
    }

    const scalars: Record<string, number> = {};
    for (const param of def.params) {
      const value = scope[param.name];
      if (value !== undefined) scalars[param.name] = value;
    }

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
      const target = { type: "node" as const, id: this.owner.instanceId, field: "component" };
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
    components: new Map(doc.components.map((c) => [c.id, c])),
    diagnostics,
  };

  const context = new Context(doc.nodes, scope, env, 0, null);
  const paths = context.paths();
  const nodes = context.infos();
  const rulers = context.rulers(doc.rulers);

  const production = paths.filter((p) => p.lineType !== "guide");

  let bleed: Prim[] = [];
  if (inputs.bleed && inputs.bleed > 0) {
    try {
      bleed = offsetOf(
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
    nodes,
    rulers,
    scope,
    diagnostics: diagnostics.list,
    bounds: pathsBounds(production),
  };
}
