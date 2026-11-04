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
  description: "A closure panel with a rounded tuck flap and friction locks, as on tuck-end cartons.",
  // The lid draws its own hinge, raised off the body's edge.
  edge: { hinge: "none" },
  params: [auto("depth", "Lid depth, fold to fold"), auto("tuck", "Tuck depth"), auto("lock", "Friction lock length")],
  variables: [
    // Fold to fold, the lid is exactly as deep as the box across the opening,
    // so closed, the tuck fold sits right on the far wall's top edge.
    { name: "d", expr: `depth > 0 ? depth : ${ACROSS}` },
    // The lid's hinge is raised off the body's edge by the board, so the lid
    // closes on top of the walls instead of pinching their edges.
    { name: "s", expr: "max(0.2, thickness)" },
    // The tuck table the old Door model used, by lid width.
    { name: "t", expr: "tuck > 0 ? tuck : (edge >= 180 ? 25 : edge >= 130 ? 20 : edge >= 100 ? 15 : edge >= 60 ? 13 : 11)" },
    // The tuck is a little narrower than the lid, so it slides between the side walls.
    { name: "k", expr: "max(0.2, thickness)" },
    // Friction locks: slits along the tuck fold at both ends. The tuck's
    // shoulders catch on the dust flaps, which holds the lid shut.
    { name: "n", expr: "lock > 0 ? k + lock : k + clamp(edge * 0.06, 3, 8)" },
    { name: "r", expr: "min(t * 0.6, (edge - 2 * k) / 2)" },
    // The tuck folds a little below the lid's edge, so it turns over the board's
    // own thickness instead of crushing it. Each slit runs along the edge, then
    // rounds down into a short hook past the fold, where the fold begins; the
    // hook is what the tuck's shoulder catches on.
    { name: "f", expr: "max(0.2, thickness)" },
    { name: "h", expr: "f + max(0.2, thickness)" },
    { name: "rh", expr: "f * 0.8" },
    // Tuck fold, and the lid's edge where the locks run.
    { name: "L", expr: "s + d" },
    { name: "E", expr: "L + f" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [to("0", "E"), to("k", "E"), to("k", "E + t", "r"), to("edge - k", "E + t", "r"), to("edge - k", "E"), to("edge", "E"), to("edge", "0")]),
    line("hinge", "crease", ["0", "s"], ["edge", "s"]),
    path("lockStart", "cut", ["k", "E"], [to("n", "E", "rh"), to("n", "E - h")]),
    path("lockEnd", "cut", ["edge - k", "E"], [to("edge - n", "E", "rh"), to("edge - n", "E - h")]),
    line("tuckFold", "crease", ["n", "L"], ["edge - n", "L"]),
  ],
  anchors: [
    { name: "hinge", at: { x: "0", y: "s" } },
    { name: "fold", at: { x: "0", y: "L" } },
    { name: "tip", at: { x: "edge / 2", y: "E + t" } },
  ],
};

export const dustFlap: ComponentDef = {
  id: "lib:dustFlap",
  name: "Dust flap",
  category: "Closures",
  description: "Side flap under a lid: nearly square with a relief notch on the lid side (the end of the edge); at the start it steps back a board's thickness from the fold, then a chamfer and a long slope. Flip it so the notch sits next to the lid.",
  // The flap draws its own crease, stopping short of the relief notch.
  edge: { hinge: "none" },
  params: [auto("depth", "Depth"), auto("slope", "Slope width"), auto("round", "Corner radius")],
  variables: [
    // Half as deep as the lid with its tuck: the lid spans this edge, and its
    // tuck follows the lid's own width (across this edge), by the same table.
    { name: "lt", expr: `${ACROSS} >= 180 ? 25 : ${ACROSS} >= 130 ? 20 : ${ACROSS} >= 100 ? 15 : ${ACROSS} >= 60 ? 13 : 11` },
    { name: "d", expr: `depth > 0 ? depth : min((edge + lt) / 2, ${ACROSS} / 2 - thickness)` },
    // Relief beside a lid: a small round notch where lid and flap fold side by
    // side, so the board does not bind or crush there. Sized by the board.
    // The notch is as wide as the board is thick: its radius is half the thickness.
    { name: "rr", expr: "max(0.1, thickness / 2)" },
    { name: "nr", expr: "endNext ? rr : 0" },
    // Lid side: set in from the fold so the lid's tuck clears it, a little more at the top.
    { name: "it", expr: "min(5, edge / 10)" },
    { name: "ib", expr: "max(it * 0.75, 2 * rr + 0.5)" },
    // A short run into the corner leaves the lid's cut line at once (no double knife).
    { name: "rb", expr: "min(5, d / 6)" },
    // Far side: straight up a little, a chamfer, then a long slope to the top.
    { name: "v", expr: "min(6, d * 0.15)" },
    { name: "ch", expr: "min(4, d * 0.1)" },
    { name: "sl", expr: "slope > 0 ? slope : min(edge / 6, d * 0.2)" },
    // Beside a plain panel edge the far side steps back a board's thickness
    // from the fold, into this flap's own panel, and rises straight: folded,
    // it then clears the wall it wraps around. Anywhere else it leans off the
    // fold, clear of whatever is there. The end of the body counts as plain.
    { name: "s0", expr: "startFree ? max(0.2, thickness) : 0" },
    { name: "g", expr: "startFree ? 0 : max(1, 2 * thickness)" },
    { name: "rt", expr: "round > 0 ? round : min(8, d / 4, (edge - it - s0 - g - ch - sl) / 3)" },
  ],
  nodes: [
    path("outline", "cut", ["s0", "0"], [
      to("s0 + g", "v"),
      to("s0 + g + ch", "v + ch"),
      to("s0 + g + ch + sl", "d", "rt"),
      to("edge - it", "d"),
      to("edge - ib", "rb"),
    ]),
    { ...path("relief", "cut", ["edge - ib", "rb"], [to("edge - 2 * rr", "0"), { type: "arc", x: "edge", y: "0", radius: "rr" }]), rules: [{ id: "noLid", when: "!endNext", action: "hide" }] },
    { ...line("corner", "cut", ["edge - ib", "rb"], ["edge", "0"]), rules: [{ id: "lid", when: "endNext", action: "hide" }] },
    { ...line("setBack", "cut", ["0", "0"], ["s0", "0"]), rules: [{ id: "noSetBack", when: "!startFree", action: "hide" }] },
    line("hinge", "crease", ["s0", "0"], ["edge - 2 * nr", "0"]),
  ],
};

export const glueFlap: ComponentDef = {
  id: "lib:glueFlap",
  name: "Glue flap",
  category: "Flaps",
  description: "Tapered flap glued inside the opposite panel to close the tube.",
  edge: { hinge: "crease" },
  params: [auto("depth", "Depth"), auto("taper", "Taper")],
  variables: [
    // A carton glue flap is 10–18 mm, by the narrower face (not the panel height).
    { name: "d", expr: "depth > 0 ? depth : clamp(min(width, length) * 0.25, 10, 18)" },
    // A shallow taper at each end, about 15° off square, so it clears the flaps.
    { name: "tp", expr: "taper > 0 ? taper : min(d * 0.27, edge / 6)" },
    { name: "gm", expr: "min(2, d / 4)" },
    // Horizontal shift that keeps the margin square to the slanted sides.
    { name: "gs", expr: "gm * sqrt(1 + (tp / d) ^ 2)" },
  ],
  nodes: [
    // The flap runs the full height of the panel: its ends start exactly on the
    // body's top and bottom edges.
    path("outline", "cut", ["0", "0"], [to("tp", "d"), to("edge - tp", "d"), to("edge", "0")]),
    // The glue area follows the flap's taper, a margin `gm` inside every edge.
    path(
      "glueArea",
      "glue",
      ["tp * gm / d + gs", "gm"],
      [to("tp * (d - gm) / d + gs", "d - gm"), to("edge - tp * (d - gm) / d - gs", "d - gm"), to("edge - tp * gm / d - gs", "gm")],
      true,
    ),
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
