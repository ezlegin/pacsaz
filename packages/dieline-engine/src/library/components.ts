import type { ComponentDef, Expr, LineNode, LineType, Node, Param, Segment } from "../spec/types";

/**
 * Built-in components, written in the document format itself so they are
 * readable, testable and replaceable: a document component with the same id
 * shadows the built-in one.
 *
 * Edge components draw in the edge frame: the hinge runs from (0, 0) to
 * (edge, 0) and the feature extends towards +y. Inside them, `edge` is the edge
 * length and `width`, `length`, `height`, `thickness` are the box's.
 *
 * Sizes default to 0 meaning "work it out": a lid is as deep as the box's other
 * dimension, a tuck flap follows the usual size table, and so on. Any of them
 * can be overridden per feature.
 */

const to = (x: Expr, y: Expr, round?: Expr): Segment => (round ? { type: "to", x, y, round } : { type: "to", x, y });

const path = (name: string, lineType: LineType, start: [Expr, Expr], segments: Segment[], closed = false): Node => ({
  id: name,
  name,
  kind: "path",
  lineType,
  closed,
  start: { x: start[0], y: start[1] },
  segments,
});

const line = (name: string, lineType: LineType, a: [Expr, Expr], b: [Expr, Expr]): LineNode => ({
  id: name,
  name,
  kind: "line",
  lineType,
  from: { x: a[0], y: a[1] },
  to: { x: b[0], y: b[1] },
});

const auto = (name: string, label: string): Param => ({ name, label: `${label} (0 = auto)`, default: 0, min: 0, unit: "mm" });

/** The box dimension across the opening from an edge: a length panel's lid spans the width. */
const ACROSS = "(abs(edge - length) < 0.01 ? width : length)";

export const tuckLid: ComponentDef = {
  id: "lib:tuckLid",
  name: "Tuck lid",
  category: "Closures",
  description: "A closure panel with a rounded tuck flap, as on tuck-end cartons.",
  edge: { hinge: "crease" },
  params: [auto("depth", "Lid depth"), auto("tuck", "Tuck depth"), auto("taper", "Tuck taper")],
  variables: [
    { name: "d", expr: `depth > 0 ? depth : ${ACROSS}` },
    // The tuck table the old Door model used, by lid width.
    { name: "t", expr: "tuck > 0 ? tuck : (edge >= 180 ? 25 : edge >= 130 ? 20 : edge >= 100 ? 15 : edge >= 60 ? 13 : 11)" },
    { name: "i", expr: "taper > 0 ? taper : max(t * 0.15, 2)" },
    { name: "r", expr: "t * 0.6" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [to("0", "d"), to("i", "d + t", "r"), to("edge - i", "d + t", "r"), to("edge", "d"), to("edge", "0")]),
    line("tuckFold", "crease", ["0", "d"], ["edge", "d"]),
  ],
  anchors: [
    { name: "fold", at: { x: "0", y: "d" } },
    { name: "tip", at: { x: "edge / 2", y: "d + t" } },
  ],
};

export const dustFlap: ComponentDef = {
  id: "lib:dustFlap",
  name: "Dust flap",
  category: "Closures",
  description: "Side flap under a lid. Flip it so the sloped end sits next to the lid.",
  edge: { hinge: "crease" },
  params: [auto("depth", "Depth"), auto("shoulder", "Slope length"), auto("round", "Corner radius")],
  variables: [
    // Half the dimension across the opening, less the board, so the two flaps meet.
    { name: "d", expr: `depth > 0 ? depth : ${ACROSS} / 2 - thickness` },
    { name: "s", expr: "shoulder > 0 ? shoulder : min(6, edge / 4)" },
    { name: "r", expr: "round > 0 ? round : min(4, d / 4)" },
    { name: "ins", expr: "2 * thickness" },
    // The lid next door is cut along the shared fold line, so the sloped end
    // must leave that line straight away; running down it would be a double knife.
    { name: "gap", expr: "max(1.5, 2 * thickness)" },
  ],
  nodes: [path("outline", "cut", ["0", "0"], [to("ins", "d", "r"), to("edge - s", "d", "r"), to("edge - gap", "d / 2"), to("edge", "0")])],
};

export const glueFlap: ComponentDef = {
  id: "lib:glueFlap",
  name: "Glue flap",
  category: "Flaps",
  description: "Tapered flap glued inside the opposite panel to close the tube.",
  edge: { hinge: "crease" },
  params: [auto("depth", "Depth"), auto("taper", "Taper")],
  variables: [
    { name: "d", expr: "depth > 0 ? depth : clamp(edge * 0.15, 12, 25)" },
    { name: "tp", expr: "taper > 0 ? taper : min(d * 0.6, edge / 6)" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [to("tp", "d"), to("edge - tp", "d"), to("edge", "0")]),
    {
      id: "glueArea",
      name: "glueArea",
      kind: "rect",
      lineType: "glue",
      width: "max(edge - 2 * tp - 4, 1)",
      height: "max(d - 4, 1)",
      transform: { x: "tp + 2", y: "2" },
    },
  ],
};

export const slottedFlap: ComponentDef = {
  id: "lib:slottedFlap",
  name: "Slotted flap (FEFCO)",
  category: "Flaps",
  description: "Corrugated case flap with half a slot on each side, as on FEFCO 0201.",
  // The flap draws its own crease between the slots.
  edge: { hinge: "none" },
  params: [auto("depth", "Depth"), auto("slot", "Slot width")],
  variables: [
    { name: "d", expr: "depth > 0 ? depth : width / 2" },
    { name: "s", expr: "slot > 0 ? slot : max(3, 2 * thickness)" },
    { name: "h", expr: "s / 2" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [to("h", "0"), to("h", "d"), to("edge - h", "d"), to("edge - h", "0"), to("edge", "0")]),
    line("hinge", "crease", ["h", "0"], ["edge - h", "0"]),
  ],
};

export const plainFlap: ComponentDef = {
  id: "lib:plainFlap",
  name: "Flap",
  category: "Flaps",
  description: "A straight or tapered flap.",
  edge: { hinge: "crease" },
  params: [
    { name: "depth", label: "Depth", default: 15, min: 1, unit: "mm" },
    { name: "insetStart", label: "Taper at start", default: 0, min: 0, unit: "mm" },
    { name: "insetEnd", label: "Taper at end", default: 0, min: 0, unit: "mm" },
    { name: "round", label: "Corner radius", default: 0, min: 0, unit: "mm" },
  ],
  variables: [],
  nodes: [
    path("outline", "cut", ["0", "0"], [to("insetStart", "depth", "round"), to("edge - insetEnd", "depth", "round"), to("edge", "0")]),
  ],
};

export const thumbNotch: ComponentDef = {
  id: "lib:thumbNotch",
  name: "Thumb notch",
  category: "Cut-outs",
  description: "Half-round finger cut into the edge, for opening.",
  // The notch replaces the edge, so it draws the cut itself.
  edge: { hinge: "none" },
  params: [
    { name: "radius", label: "Radius", default: 10, min: 1, unit: "mm" },
    { name: "position", label: "Centre along the edge (0 = middle)", default: 0, min: 0, unit: "mm" },
  ],
  variables: [{ name: "c", expr: "position > 0 ? position : edge / 2" }],
  nodes: [
    path("edgeCut", "cut", ["0", "0"], [
      to("c - radius", "0"),
      // A half circle into the panel (towards -y in the edge frame).
      { type: "arc", x: "c + radius", y: "0", radius: "radius" },
      to("edge", "0"),
    ]),
  ],
};

export const LIBRARY: ComponentDef[] = [tuckLid, dustFlap, glueFlap, slottedFlap, plainFlap, thumbNotch];

export const EDGE_COMPONENTS = LIBRARY.filter((c) => c.edge);
