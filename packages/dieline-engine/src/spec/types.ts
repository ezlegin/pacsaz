/**
 * Dieline document format, version 2.
 *
 * Every number a designer types is an `Expr`: a restricted math expression that
 * may use the built-in dimensions (`width`, `length`, `height`, `thickness`), the
 * document's params and variables, and references to other nodes
 * (`@sidePanel.topRight.x`, `@lid.width`). The engine evaluates them for whatever
 * size the dieline is generated at, which is what makes a template parametric.
 *
 * Coordinates are millimetres with Y pointing up; angles are degrees.
 */

export const SPEC_VERSION = 2;

/** A math expression, e.g. `width + 2 * thickness` or `@lid.right.x`. */
export type Expr = string;

export type PointExpr = { x: Expr; y: Expr };

/**
 * What a line does on the die. The names follow the die-making trade so they map
 * directly to DXF layers and to what a die maker expects.
 */
export type LineType =
  /** Knife: cuts through the board. */
  | "cut"
  /** Creasing rule: folds away from the printed side. */
  | "crease"
  /** Reverse crease: folds towards the printed side. */
  | "reverseCrease"
  /** Perforation: alternating cut and tie, tears by hand. */
  | "perf"
  /** Cut-and-crease (zipper-like): alternating cut and crease, for tight folds. */
  | "cutCrease"
  /** Partial-depth cut (kiss cut), mostly for labels and peel-offs. */
  | "halfCut"
  /** Glue area outline. Informational, not a tool line. */
  | "glue"
  /** Construction geometry. Rendered in the editor, never exported for production. */
  | "guide";

export const LINE_TYPES: readonly LineType[] = [
  "cut",
  "crease",
  "reverseCrease",
  "perf",
  "cutCrease",
  "halfCut",
  "glue",
  "guide",
];

//! Placement -------------------------------------------------------------------

/**
 * Where a node sits inside its parent. The geometry is built in the node's own
 * local frame, then mirrored about the local axes, then rotated about the local
 * origin, then moved by `x`/`y`. One fixed order keeps transforms predictable.
 */
export type Transform = {
  x?: Expr;
  y?: Expr;
  rotate?: Expr;
  mirrorX?: boolean;
  mirrorY?: boolean;
};

//! Visibility rules ---------------------------------------------------------------

/**
 * Conditional visibility. Rules apply in order and the last match wins, so a
 * `show` can carve an exception out of an earlier `hide`. The node's own `hidden`
 * flag is the starting point.
 */
export type Rule = { id: string; when: Expr; action: "hide" | "show" };

//! Modifiers ----------------------------------------------------------------------

/**
 * Non-destructive operations applied to a node's local geometry, in order, before
 * the node's transform. They replace the old "effects" and "dup" systems.
 */
export type Modifier = ModifierBody & {
  /** Switched off in the editor without being deleted. */
  disabled?: boolean;
};

type ModifierBody =
  | {
      type: "round";
      radius: Expr;
      /** Corner indices to round; omitted means every corner. */
      corners?: number[];
    }
  /** Round every corner by the largest radius it can take. */
  | { type: "roundFull" }
  /** Linear repeat: `count` copies in total, each `dx`/`dy` from the previous. */
  | { type: "array"; count: Expr; dx: Expr; dy: Expr }
  /** Adds a mirrored copy across a vertical (`axis: "x"`) or horizontal line. */
  | { type: "mirrorCopy"; axis: "x" | "y"; at: Expr }
  /** Adds one transformed copy, keeping the original. */
  | {
      type: "copy";
      dx: Expr;
      dy: Expr;
      rotate?: Expr;
      mirrorX?: boolean;
      mirrorY?: boolean;
    }
  /** Offsets closed outlines outward (positive) or inward (negative). */
  | { type: "offset"; distance: Expr };

export type ModifierType = Modifier["type"];

//! Nodes ------------------------------------------------------------------------

type NodeBase = {
  id: string;
  /** Reference identifier used in expressions (`@name...`). Unique per scope. */
  name: string;
  /** Display name for the outline. Falls back to `name`. */
  label?: string;
  hidden?: boolean;
  /** Customize mode: a locked node cannot be edited by the customer. */
  locked?: boolean;
  transform?: Transform;
  modifiers?: Modifier[];
  rules?: Rule[];
};

/** Shapes draw with one line type; path segments may override it. */
type ShapeBase = NodeBase & { lineType: LineType };

export type LineNode = ShapeBase & {
  kind: "line";
  from: PointExpr;
  to: PointExpr;
};

/**
 * One step of a path. Each segment starts where the previous one ended.
 *
 * `round` rounds the corner at the *end* of this segment (where it meets the next
 * one); it only applies between two straight segments.
 */
export type Segment = (
  | { type: "to"; x: Expr; y: Expr }
  | { type: "by"; dx: Expr; dy: Expr }
  | { type: "polar"; length: Expr; angle: Expr }
  | {
      type: "arc";
      /** End point, absolute or relative to the segment start. */
      x: Expr;
      y: Expr;
      relative?: boolean;
      radius: Expr;
      clockwise?: boolean;
      /** Take the long way round (more than 180°). */
      large?: boolean;
    }
) & { lineType?: LineType; round?: Expr };

export type PathNode = ShapeBase & {
  kind: "path";
  start: PointExpr;
  segments: Segment[];
  closed: boolean;
};

/** Built from its bottom-left corner at the local origin. */
export type RectNode = ShapeBase & {
  kind: "rect";
  width: Expr;
  height: Expr;
  /** One radius for all corners, or `[bottomLeft, bottomRight, topRight, topLeft]`. */
  radius?: Expr | [Expr, Expr, Expr, Expr];
  /** Leave one side out, e.g. a panel whose top edge is a fold drawn elsewhere. */
  openSide?: "top" | "right" | "bottom" | "left";
};

/** Centred on the local origin. A circle when `rx` equals `ry`. */
export type EllipseNode = ShapeBase & { kind: "ellipse"; rx: Expr; ry: Expr };

/** Centred on the local origin, counter-clockwise from `start` to `end`. */
export type ArcNode = ShapeBase & {
  kind: "arc";
  radius: Expr;
  start: Expr;
  end: Expr;
};

/** Regular polygon centred on the local origin. */
export type PolygonNode = ShapeBase & {
  kind: "polygon";
  sides: Expr;
  radius: Expr;
  /** Angle of the first corner; 90 puts a corner at the top. */
  angle?: Expr;
};

export type StarNode = ShapeBase & {
  kind: "star";
  points: Expr;
  radius: Expr;
  /** Defaults to 38.2% of `radius`, the classic five-point star. */
  innerRadius?: Expr;
  angle?: Expr;
};

/**
 * Two circles of different radii joined by tangent lines (strap and handle
 * cut-outs). Centres sit on the X axis, `distance` apart, starting at the origin.
 */
export type BeltNode = ShapeBase & {
  kind: "belt";
  radius1: Expr;
  radius2: Expr;
  distance: Expr;
};

export type ShapeNode =
  | LineNode
  | PathNode
  | RectNode
  | EllipseNode
  | ArcNode
  | PolygonNode
  | StarNode
  | BeltNode;

export type ShapeKind = ShapeNode["kind"];

/**
 * How a group's children are merged before its modifiers run.
 * `join` connects the nearest open ends of exactly two children with a line.
 */
export type Combine =
  | { op: "union" | "subtract" | "intersect" }
  | { op: "join" };

export type GroupNode = NodeBase & {
  kind: "group";
  children: Node[];
  combine?: Combine;
};

/** A placed copy of a component, with argument expressions for its params. */
export type InstanceNode = NodeBase & {
  kind: "instance";
  component: string;
  args: Record<string, Expr>;
};

//! Box bodies ----------------------------------------------------------------------

/**
 * Something attached along a panel edge: a tuck lid, a dust flap, a glue flap, a
 * notch. It is a component drawn in the *edge frame*: the hinge runs from (0, 0)
 * to (edge, 0) along +x and the feature extends towards +y. The body places it
 * on whichever edge it belongs to. Inside the component, `edge` is the length of
 * the edge it sits on.
 */
export type EdgeFeature = {
  component: string;
  args?: Record<string, Expr>;
  /** Mirror the feature end to end along its edge. */
  flip?: boolean;
  /** The line along the hinge. Defaults to the component's own choice. */
  hinge?: LineType | "none";
};

export type Panel = {
  id: string;
  /** Used in references: `@body.front.topLeft.x`. */
  name: string;
  width: Expr;
  top?: EdgeFeature;
  bottom?: EdgeFeature;
};

/**
 * The body of a folding box: panels side by side, all `height` tall, with a fold
 * between neighbours. Free edges are cut; an edge with a feature becomes its
 * hinge. This is how most cartons are built, and it replaces drawing the outline
 * and every crease by hand.
 */
export type PanelsNode = NodeBase & {
  kind: "panels";
  height: Expr;
  panels: Panel[];
  /** Feature on the outer edge of the first panel (often the glue flap). */
  left?: EdgeFeature;
  /** Feature on the outer edge of the last panel. */
  right?: EdgeFeature;
  /** Line between neighbouring panels. Defaults to a crease. */
  fold?: LineType;
};

export type EdgeSide = "top" | "bottom" | "left" | "right";

export type Node = ShapeNode | GroupNode | InstanceNode | PanelsNode;
export type NodeKind = Node["kind"];

//! Params, variables, components -------------------------------------------------

/**
 * A named input with a default. `exposed` params are what a customer sees in
 * Customize mode, with `min`/`max` as the allowed range.
 */
export type Param = {
  name: string;
  label?: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: "mm" | "deg" | "count";
  exposed?: boolean;
};

/**
 * A derived value. `cases` are tried in order and the first whose `when` holds
 * supplies the expression; otherwise `expr` is used. Variables may use each other
 * in any order: they are evaluated in dependency order.
 */
export type Variable = {
  name: string;
  expr: Expr;
  cases?: { when: Expr; expr: Expr }[];
  description?: string;
};

/**
 * A reusable part (tuck flap, dust flap, lock tab ...). It is a little document of
 * its own: it sees the built-in dimensions and its own params, never the caller's
 * nodes, so it behaves the same wherever it is placed.
 */
export type ComponentDef = {
  id: string;
  name: string;
  description?: string;
  params: Param[];
  variables: Variable[];
  nodes: Node[];
  /** Extra named points exposed on every instance, e.g. a hinge end. */
  anchors?: { name: string; at: PointExpr }[];
  /**
   * Present when the component is meant for panel edges. `hinge` is the line the
   * body draws along the edge: a crease for flaps, "none" for features such as a
   * notch that draw the edge themselves.
   */
  edge?: { hinge: LineType | "none" };
  /** Grouping in pickers, e.g. "Closures", "Flaps", "Cut-outs". */
  category?: string;
};

export type Ruler = {
  id: string;
  name: string;
  hidden?: boolean;
  from: PointExpr;
  to: PointExpr;
  /** Distance of the dimension line from the measured points, perpendicular. */
  offset: Expr;
  rules?: Rule[];
};

export type DielineDocument = {
  version: typeof SPEC_VERSION;
  params: Param[];
  variables: Variable[];
  nodes: Node[];
  rulers: Ruler[];
  components: ComponentDef[];
};

export function emptyDocument(): DielineDocument {
  return {
    version: SPEC_VERSION,
    params: [],
    variables: [],
    nodes: [],
    rulers: [],
    components: [],
  };
}
