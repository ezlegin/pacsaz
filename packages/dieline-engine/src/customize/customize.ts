import { z } from "zod";
import { checkDieline, type Issue } from "../checks/checks";
import { offsetExpr } from "../edit/exprEdit";
import { allNodes, uniqueName } from "../edit/tree";
import { render, type RenderInputs, type RenderResult } from "../eval/render";
import { LIBRARY } from "../library/components";
import { LIMITS } from "../spec/schema";
import type {
  ComponentDef,
  CutoutRules,
  DielineDocument,
  EdgeFeature,
  EdgeSide,
  Node,
  Param,
  PanelsNode,
  RectNode,
  EllipseNode,
} from "../spec/types";

/**
 * Customize mode.
 *
 * A customer's copy of a template is not a document of its own: it is the
 * template plus a `Customization`, a small overlay that says which of the
 * changes the designer allowed were made. Keeping it an overlay is what makes it
 * safe to accept from a browser. Every entry can be checked against the
 * template's own rules (`validateCustomization`), the result is rebuilt by the
 * engine rather than trusted (`verifyCustomization`), and a later fix to the
 * template reaches every customer copy.
 */

/** A window or hole, centred `cx`/`cy` mm from the centre of a body's panel. */
export type Cutout = {
  id: string;
  shape: "rect" | "ellipse";
  /** `bodyName.panelName`, e.g. `body.front`. */
  panel: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** Corner radius of a rectangular window. */
  radius?: number;
};

export type Customization = {
  /** Values for exposed params, by name. */
  params?: Record<string, number>;
  /** By node id: switch an optional part on or off, move a movable one. */
  nodes?: Record<string, { hidden?: boolean; dx?: number; dy?: number }>;
  /** By edge key (see `edgeKey`): another part for the edge and its settings. */
  edges?: Record<string, { component?: string; args?: Record<string, number> }>;
  cutouts?: Cutout[];
};

export const emptyCustomization = (): Customization => ({});

const num = z.number().finite().min(-100_000).max(100_000);
const key = z.string().min(1).max(200);

export const customizationSchema = z
  .object({
    params: z.record(key, num).optional(),
    nodes: z
      .record(key, z.object({ hidden: z.boolean().optional(), dx: num.optional(), dy: num.optional() }).strict())
      .optional(),
    edges: z
      .record(
        key,
        z.object({ component: z.string().min(1).max(100).optional(), args: z.record(key, num).optional() }).strict(),
      )
      .optional(),
    cutouts: z
      .array(
        z
          .object({
            id: z.string().min(1).max(64),
            shape: z.enum(["rect", "ellipse"]),
            panel: key,
            cx: num,
            cy: num,
            width: num,
            height: num,
            radius: num.optional(),
          })
          .strict(),
      )
      .max(LIMITS.cutouts)
      .optional(),
  })
  .strict();

export function parseCustomization(input: unknown): { ok: true; customization: Customization } | { ok: false; errors: string[] } {
  const parsed = customizationSchema.safeParse(input);
  if (parsed.success) return { ok: true, customization: parsed.data };
  return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".") || "customization"}: ${i.message}`) };
}

//! What the template allows ---------------------------------------------------------

/** Stable key of a body edge: `bodyId/panelId/top`, or `bodyId/left` for the outer edges. */
export function edgeKey(bodyId: string, side: EdgeSide, panelId?: string): string {
  return panelId ? `${bodyId}/${panelId}/${side}` : `${bodyId}/${side}`;
}

export type CustomizableEdge = {
  key: string;
  bodyId: string;
  bodyName: string;
  /** Missing for the body's outer left and right edges. */
  panelName?: string;
  side: EdgeSide;
  /** The template's own part on this edge, or "none". */
  component: string;
  /** Parts the customer may pick, the template's own first. */
  choices: string[];
  /** Arg names the customer may set. */
  args: string[];
};

export type CustomizableNode = {
  id: string;
  name: string;
  label: string;
  optional: boolean;
  /** Largest move along each axis, 0 when it cannot move. */
  move: number;
  /** The template draws it switched off. */
  hiddenByDefault: boolean;
};

export type CustomizeOptions = {
  params: Param[];
  nodes: CustomizableNode[];
  edges: CustomizableEdge[];
  cutouts: CutoutRules | null;
  /** Panels a cut-out may go in, as `bodyName.panelName`. */
  panels: string[];
  /** False when the designer exposed nothing at all. */
  any: boolean;
};

export function componentById(doc: DielineDocument, id: string): ComponentDef | undefined {
  return doc.components.find((c) => c.id === id) ?? LIBRARY.find((c) => c.id === id);
}

/** The params of `component` the customer may set on an edge. */
export function edgeArgParams(doc: DielineDocument, component: string, allowed: readonly string[]): Param[] {
  const def = componentById(doc, component);
  if (!def) return [];
  return def.params.filter((p) => allowed.includes(p.name));
}

function bodyEdges(body: PanelsNode): { side: EdgeSide; panelId?: string; panelName?: string; feature?: EdgeFeature }[] {
  const out: { side: EdgeSide; panelId?: string; panelName?: string; feature?: EdgeFeature }[] = [];
  for (const p of body.panels) {
    out.push({ side: "top", panelId: p.id, panelName: p.name, feature: p.top });
    out.push({ side: "bottom", panelId: p.id, panelName: p.name, feature: p.bottom });
  }
  out.push({ side: "left", feature: body.left });
  out.push({ side: "right", feature: body.right });
  return out;
}

export function customizeOptions(doc: DielineDocument): CustomizeOptions {
  const nodes: CustomizableNode[] = [];
  const edges: CustomizableEdge[] = [];
  const panels: string[] = [];

  for (const n of allNodes(doc)) {
    const c = n.customize;
    if (c && (c.optional || (c.move ?? 0) > 0)) {
      nodes.push({
        id: n.id,
        name: n.name,
        label: n.label || n.name,
        optional: !!c.optional,
        move: c.move ?? 0,
        hiddenByDefault: !!n.hidden,
      });
    }
    if (n.kind !== "panels") continue;

    for (const p of n.panels) panels.push(`${n.name}.${p.name}`);
    for (const e of bodyEdges(n)) {
      const ec = e.feature?.customize;
      if (!ec || (!ec.choices?.length && !ec.args?.length)) continue;
      const own = e.feature!.component;
      edges.push({
        key: edgeKey(n.id, e.side, e.panelId),
        bodyId: n.id,
        bodyName: n.name,
        panelName: e.panelName,
        side: e.side,
        component: own,
        choices: [own, ...(ec.choices ?? []).filter((c) => c !== own)],
        args: ec.args ?? [],
      });
    }
  }

  const params = doc.params.filter((p) => p.exposed);
  const cutouts = doc.customize?.cutouts && doc.customize.cutouts.max > 0 && panels.length ? doc.customize.cutouts : null;

  return {
    params,
    nodes,
    edges,
    cutouts,
    panels,
    any: params.length > 0 || nodes.length > 0 || edges.length > 0 || cutouts !== null,
  };
}

//! Checking an overlay ------------------------------------------------------------------

export type CustomizeProblemCode =
  | "invalid"
  | "notExposed"
  | "outOfRange"
  | "notOptional"
  | "tooFar"
  | "notAllowed"
  | "unknownPanel"
  | "tooMany"
  | "tooSmall"
  | "outsidePanel"
  | "overlap"
  | "geometry";

export type CustomizeProblem = {
  code: CustomizeProblemCode;
  /** What the problem is about: `params.lid`, `nodes.<id>`, `edges.<key>`, `cutouts.<id>`. */
  path: string;
  message: string;
};

const inRange = (v: number, p: { min?: number; max?: number }) =>
  (p.min === undefined || v >= p.min - 1e-9) && (p.max === undefined || v <= p.max + 1e-9);

const range = (p: { min?: number; max?: number }) =>
  `${p.min ?? "−∞"} to ${p.max ?? "∞"}`;

/**
 * Checks every entry of an overlay against what the template allows, without
 * rendering. Anything the designer did not expose is rejected, not ignored, so a
 * tampered request is visible.
 */
export function validateCustomization(doc: DielineDocument, c: Customization): CustomizeProblem[] {
  const problems: CustomizeProblem[] = [];
  const options = customizeOptions(doc);

  for (const [name, value] of Object.entries(c.params ?? {})) {
    const p = options.params.find((x) => x.name === name);
    if (!p) problems.push({ code: "notExposed", path: `params.${name}`, message: `"${name}" cannot be changed` });
    else if (!inRange(value, p)) problems.push({ code: "outOfRange", path: `params.${name}`, message: `${p.label || name} must be ${range(p)}` });
  }

  for (const [id, change] of Object.entries(c.nodes ?? {})) {
    const n = options.nodes.find((x) => x.id === id);
    const path = `nodes.${id}`;
    if (!n) {
      problems.push({ code: "notExposed", path, message: "This part cannot be changed" });
      continue;
    }
    if (change.hidden !== undefined && !n.optional) problems.push({ code: "notOptional", path, message: `${n.label} cannot be switched off` });
    for (const axis of ["dx", "dy"] as const) {
      const d = change[axis];
      if (d !== undefined && Math.abs(d) > n.move + 1e-9) {
        problems.push({ code: "tooFar", path, message: `${n.label} moves at most ${n.move} mm` });
        break;
      }
    }
  }

  for (const [k, change] of Object.entries(c.edges ?? {})) {
    const e = options.edges.find((x) => x.key === k);
    const path = `edges.${k}`;
    if (!e) {
      problems.push({ code: "notExposed", path, message: "This edge cannot be changed" });
      continue;
    }
    const component = change.component ?? e.component;
    if (!e.choices.includes(component) || (component !== "none" && !componentById(doc, component))) {
      problems.push({ code: "notAllowed", path, message: "This part is not available here" });
      continue;
    }
    const params = edgeArgParams(doc, component, e.args);
    for (const [name, value] of Object.entries(change.args ?? {})) {
      const p = params.find((x) => x.name === name);
      if (!p) problems.push({ code: "notExposed", path: `${path}.${name}`, message: `"${name}" cannot be changed` });
      else if (!inRange(value, p)) problems.push({ code: "outOfRange", path: `${path}.${name}`, message: `${p.label || name} must be ${range(p)}` });
    }
  }

  const cutouts = c.cutouts ?? [];
  if (cutouts.length) {
    const rules = options.cutouts;
    if (!rules) {
      problems.push({ code: "notAllowed", path: "cutouts", message: "Windows and holes are not available for this template" });
    } else {
      if (cutouts.length > rules.max) problems.push({ code: "tooMany", path: "cutouts", message: `At most ${rules.max} windows and holes` });
      const min = rules.minSize ?? 5;
      // A cut-out id becomes a node id, so it must not clash with the template's.
      const ids = new Set<string>(allNodes(doc).map((n) => n.id));
      for (const cut of cutouts) {
        const path = `cutouts.${cut.id}`;
        if (ids.has(cut.id)) problems.push({ code: "invalid", path, message: "Duplicate cut-out" });
        ids.add(cut.id);
        if (!rules.shapes.includes(cut.shape)) problems.push({ code: "notAllowed", path, message: "This shape is not available" });
        if (!options.panels.includes(cut.panel)) problems.push({ code: "unknownPanel", path, message: "Choose a panel for the window" });
        if (cut.width < min || cut.height < min) problems.push({ code: "tooSmall", path, message: `Windows are at least ${min} mm` });
        if (cut.radius !== undefined && (cut.radius < 0 || cut.radius > Math.min(cut.width, cut.height) / 2)) {
          problems.push({ code: "outOfRange", path, message: "The corner radius is too large" });
        }
      }
    }
  }

  return problems;
}

//! Applying an overlay ----------------------------------------------------------------

const CUTOUT_GROUP = "customer_cutouts";

/** The node a cut-out becomes. Placed by reference, so it follows its panel when the size changes. */
function cutoutNode(cut: Cutout, name: string): RectNode | EllipseNode {
  const [body, panel] = cut.panel.split(".");
  const at = (axis: "x" | "y") => `@${body}.${panel}.center.${axis}`;
  const n = (v: number) => String(Math.round(v * 1000) / 1000);

  if (cut.shape === "ellipse") {
    return {
      id: cut.id,
      name,
      kind: "ellipse",
      lineType: "cut",
      rx: n(cut.width / 2),
      ry: n(cut.height / 2),
      transform: { x: `${at("x")} + ${n(cut.cx)}`, y: `${at("y")} + ${n(cut.cy)}` },
    };
  }
  return {
    id: cut.id,
    name,
    kind: "rect",
    lineType: "cut",
    width: n(cut.width),
    height: n(cut.height),
    ...(cut.radius ? { radius: n(cut.radius) } : {}),
    transform: { x: `${at("x")} + ${n(cut.cx - cut.width / 2)}`, y: `${at("y")} + ${n(cut.cy - cut.height / 2)}` },
  };
}

function mapTree(nodes: Node[], fn: (n: Node) => Node): Node[] {
  return nodes.map((n) => {
    const m = fn(n);
    return m.kind === "group" ? { ...m, children: mapTree(m.children, fn) } : m;
  });
}

function applyEdge(feature: EdgeFeature | undefined, change: { component?: string; args?: Record<string, number> }): EdgeFeature | undefined {
  if (!feature) return feature;
  const component = change.component ?? feature.component;
  if (component === "none") return undefined;

  // A different part starts from its own defaults: the template's args and hinge
  // override belong to the old one.
  const same = component === feature.component;
  const args: Record<string, string> = same ? { ...feature.args } : {};
  for (const [k, v] of Object.entries(change.args ?? {})) args[k] = String(v);

  return { component, args, ...(feature.flip ? { flip: true } : {}), ...(same && feature.hinge ? { hinge: feature.hinge } : {}) };
}

/**
 * The template with an overlay applied, and the param values to render it with.
 * Pure. Entries the template does not allow should be rejected first with
 * `validateCustomization`; here they are simply skipped.
 */
export function applyCustomization(doc: DielineDocument, c: Customization): { document: DielineDocument; params: Record<string, number> } {
  const options = customizeOptions(doc);
  const nodeRules = new Map(options.nodes.map((n) => [n.id, n]));
  const edgeRules = new Map(options.edges.map((e) => [e.key, e]));

  const params: Record<string, number> = {};
  for (const p of options.params) {
    const v = c.params?.[p.name];
    if (v !== undefined) params[p.name] = v;
  }

  const nodes = mapTree(doc.nodes, (node) => {
    let n = node;
    const change = c.nodes?.[n.id];
    const rule = nodeRules.get(n.id);
    if (change && rule) {
      if (rule.optional && change.hidden !== undefined) n = { ...n, hidden: change.hidden };
      const clamp = (d: number | undefined) => Math.max(-rule.move, Math.min(rule.move, d ?? 0));
      const dx = clamp(change.dx);
      const dy = clamp(change.dy);
      if (dx || dy) {
        const t = n.transform ?? {};
        n = { ...n, transform: { ...t, x: offsetExpr(t.x ?? "0", dx), y: offsetExpr(t.y ?? "0", dy) } };
      }
    }

    if (n.kind === "panels" && c.edges) {
      const body = n;
      const edge = (side: EdgeSide, f: EdgeFeature | undefined, panelId?: string) => {
        const k = edgeKey(body.id, side, panelId);
        const ch = c.edges![k];
        const rule = edgeRules.get(k);
        if (!ch || !rule) return f;
        if (ch.component && !rule.choices.includes(ch.component)) return f;
        return applyEdge(f, ch);
      };
      n = {
        ...body,
        panels: body.panels.map((p) => ({ ...p, top: edge("top", p.top, p.id), bottom: edge("bottom", p.bottom, p.id) })),
        left: edge("left", body.left),
        right: edge("right", body.right),
      };
    }
    return n;
  });

  const cutouts = options.cutouts ? (c.cutouts ?? []).slice(0, options.cutouts.max) : [];
  if (cutouts.length) {
    const taken = new Set(allNodes(doc).map((n) => n.name));
    const groupName = uniqueName(taken, CUTOUT_GROUP);
    taken.add(groupName);
    const children = cutouts.map((cut) => {
      const name = uniqueName(taken, "window");
      taken.add(name);
      return cutoutNode(cut, name);
    });
    nodes.push({ id: `${CUTOUT_GROUP}`, name: groupName, label: "Windows and holes", kind: "group", children });
  }

  return { document: { ...doc, nodes }, params };
}

//! Verifying the result -----------------------------------------------------------------

export type VerifyResult = {
  ok: boolean;
  problems: CustomizeProblem[];
  document: DielineDocument;
  params: Record<string, number>;
  result: RenderResult;
};

const issueKey = (i: Issue) => `${i.code}:${Math.round(i.at[0])},${Math.round(i.at[1])}`;

/**
 * The full check a server runs before it accepts or exports a customer copy:
 * the overlay is allowed, the result renders without new errors, every window
 * sits inside its panel clear of folds and other windows, and the design checks
 * find nothing the template did not already have.
 *
 * `template` may be passed when it was already rendered at these inputs.
 */
export function verifyCustomization(
  doc: DielineDocument,
  c: Customization,
  inputs: RenderInputs,
  template: RenderResult = render(doc, inputs),
): VerifyResult {
  const problems = validateCustomization(doc, c);
  const { document, params } = applyCustomization(doc, c);
  const result = render(document, { ...inputs, params: { ...inputs.params, ...params } });

  const before = new Set(template.diagnostics.filter((d) => d.severity === "error").map((d) => d.message));
  for (const d of result.diagnostics) {
    if (d.severity === "error" && !before.has(d.message)) {
      problems.push({ code: "geometry", path: d.target.type === "node" ? `nodes.${d.target.id}` : "document", message: d.message });
    }
  }

  const rules = customizeOptions(doc).cutouts;
  if (rules) {
    const margin = rules.margin ?? Math.max(3, 2 * inputs.thickness);
    const placed: { id: string; b: { minX: number; minY: number; maxX: number; maxY: number } }[] = [];

    for (const cut of c.cutouts ?? []) {
      const info = result.nodes[cut.id];
      const [bodyName, panelName] = cut.panel.split(".");
      const body = Object.values(result.nodes).find((n) => n.kind === "panels" && n.name === bodyName);
      const lo = body?.anchors[`${panelName}.bottomLeft`];
      const hi = body?.anchors[`${panelName}.topRight`];
      if (!info?.bounds || !lo || !hi) continue;

      const b = info.bounds;
      const panel = {
        minX: Math.min(lo[0], hi[0]) + margin,
        minY: Math.min(lo[1], hi[1]) + margin,
        maxX: Math.max(lo[0], hi[0]) - margin,
        maxY: Math.max(lo[1], hi[1]) - margin,
      };
      if (b.minX < panel.minX - 1e-6 || b.minY < panel.minY - 1e-6 || b.maxX > panel.maxX + 1e-6 || b.maxY > panel.maxY + 1e-6) {
        problems.push({
          code: "outsidePanel",
          path: `cutouts.${cut.id}`,
          message: `Keep the window inside the panel, at least ${Math.round(margin * 10) / 10} mm from its edges`,
        });
      }
      for (const other of placed) {
        const o = other.b;
        if (b.minX < o.maxX + margin && o.minX < b.maxX + margin && b.minY < o.maxY + margin && o.minY < b.maxY + margin) {
          problems.push({ code: "overlap", path: `cutouts.${cut.id}`, message: "Windows are too close to each other" });
          break;
        }
      }
      placed.push({ id: cut.id, b });
    }
  }

  // A window in the template may interrupt a fold (the renderer trims it), but
  // a customer's moved or added part must not.
  if (result.foldsCut > template.foldsCut + 1e-3) {
    const moved = Object.entries(c.nodes ?? {}).filter(([, n]) => n.dx || n.dy || n.hidden === false).map(([id]) => `nodes.${id}`);
    const paths = [...moved, ...(c.cutouts ?? []).map((cut) => `cutouts.${cut.id}`)];
    for (const path of paths.length ? paths : ["document"]) {
      if (!problems.some((p) => p.path === path)) problems.push({ code: "geometry", path, message: "This part cuts through a fold line" });
    }
  }

  const known = new Set(checkDieline(template).map(issueKey));
  for (const issue of checkDieline(result)) {
    if (issue.severity !== "error" || known.has(issueKey(issue))) continue;
    const id = issue.nodeIds.find((n) => c.cutouts?.some((cut) => cut.id === n) || c.nodes?.[n]);
    // Cut-out placement problems are already reported in a friendlier way above.
    if (id && problems.some((p) => p.path === `cutouts.${id}`)) continue;
    problems.push({ code: "geometry", path: id ? (c.nodes?.[id] ? `nodes.${id}` : `cutouts.${id}`) : "document", message: issue.message });
  }

  return { ok: problems.length === 0, problems, document, params, result };
}
