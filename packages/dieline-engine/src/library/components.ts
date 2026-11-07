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
    { name: "s", expr: "max(0.3, thickness)" },
    // The tuck table the old Door model used, by lid width.
    { name: "t", expr: "tuck > 0 ? tuck : (edge >= 180 ? 25 : edge >= 130 ? 20 : edge >= 100 ? 15 : edge >= 60 ? 13 : 11)" },
    // The tuck is a little narrower than the lid, so it slides between the side walls.
    { name: "k", expr: "max(0.3, thickness)" },
    // Friction locks: slits along the tuck fold at both ends. The tuck's
    // shoulders catch on the dust flaps, which holds the lid shut.
    { name: "n", expr: "lock > 0 ? k + lock : k + clamp(edge * 0.06, 3, 8)" },
    { name: "r", expr: "min(t * 0.6, (edge - 2 * k) / 2)" },
    // The tuck folds a little below the lid's edge, so it turns over the board's
    // own thickness instead of crushing it. Each slit runs along the edge, then
    // rounds down into a short hook past the fold, where the fold begins; the
    // hook is what the tuck's shoulder catches on.
    { name: "f", expr: "max(0.3, thickness)" },
    { name: "h", expr: "f + max(0.3, thickness)" },
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
    // The notch is as wide as the board is thick, and never under 0.5 mm: a knife
    // cannot cut anything finer, however thin the paper.
    { name: "rr", expr: "max(0.25, thickness / 2)" },
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
    { name: "s0", expr: "startFree ? max(0.3, thickness) : 0" },
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
  ],
  nodes: [
    // The flap runs the full height of the panel: its ends start exactly on the
    // body's top and bottom edges.
    path("outline", "cut", ["0", "0"], [to("tp", "d"), to("edge - tp", "d"), to("edge", "0")]),
    // Glue covers the whole flap, right up to its edges and the fold.
    path("glueArea", "glue", ["0", "0"], [to("tp", "d"), to("edge - tp", "d"), to("edge", "0")], true),
  ],
};

export const slottedFlap: ComponentDef = {
  id: "lib:slottedFlap",
  name: "Slotted flap (FEFCO)",
  category: "Flaps",
  description: "Corrugated case flap with half a round-ended slot on each side, as on FEFCO 0201.",
  // The flap draws its own crease: on the body's edge, or raised off it.
  edge: { hinge: "none" },
  params: [
    auto("depth", "Depth from its crease"),
    auto("slot", "Slot width"),
    // The outer flaps (front and back) fold over the inner ones, so their crease
    // sits one board further out; the tips of all flaps still line up.
    { name: "raised", label: "Crease raised by the board (outer flap)", default: 0, min: 0, max: 1 },
  ],
  variables: [
    // Measured from a real die: outer flaps are half the box across the opening
    // from their crease, so the long flaps meet in the middle.
    { name: "d", expr: "depth > 0 ? depth : min(width, length) / 2" },
    { name: "t", expr: "max(0.3, thickness)" },
    // A slot is two boards wide and ends in a half circle centred on the panel
    // fold at the outer flaps' crease, so its bottom touches the inner crease.
    { name: "r", expr: "slot > 0 ? slot / 2 : t" },
    { name: "c", expr: "raised > 0 ? t : 0" },
    // Every flap's tip is one board past the outer flaps' depth.
    { name: "tip", expr: "d + t" },
    // Where the crease meets the slot: on the straight side, or on the round end.
    { name: "cx", expr: "c >= r ? r : sqrt(r ^ 2 - (r - c) ^ 2)" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [
      { type: "arc", x: "r", y: "r", radius: "r" },
      to("r", "tip"),
      to("edge - r", "tip"),
      to("edge - r", "r"),
      { type: "arc", x: "edge", y: "0", radius: "r" },
    ]),
    line("hinge", "crease", ["c > 0 ? cx : 0", "c"], ["c > 0 ? edge - cx : edge", "c"]),
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

/**
 * Between two lock flaps the board is cut away by a round hole, one circle of
 * radius `k` centred on the panel fold and rising `c` past the flaps' hinge
 * line. Each flap draws its half, from the fold to where its own side leaves
 * the circle: a straight side at (k, c), or a sloped side at (tx, ty) on the
 * hinge line. The body stops its fold at the top (`edge.relief`). A straight
 * side keeps its half at the end of a body too, and the body moves the glue
 * flap or cut edge beside it up to the top of the circle (`edge.straight`).
 */
const RELIEF_VARIABLES = [
  { name: "k", expr: "max(0.3, thickness)" },
  { name: "c", expr: "k / 2" },
  // Where the circle crosses the hinge line: a sloped side and the hinge both end there.
  { name: "hx", expr: "k * 0.866" },
  { name: "tx", expr: "hx" },
  { name: "ty", expr: "0" },
];
const STRAIGHT_START = ["k", "c"] as [Expr, Expr];
const SLOPED_START = ["startNext ? tx : 0", "startNext ? ty : 0"] as [Expr, Expr];
const STRAIGHT_END = to("edge - k", "c");
const SLOPED_END = to("edge - (endNext ? tx : 0)", "endNext ? ty : 0");

// Only a sloped side needs a neighbour for its half: alone it runs into the body's corner.
const startHole = (x: Expr, y: Expr): Node => ({
  ...path("startHole", "cut", ["0", "-c"], [{ type: "arc", x, y, radius: "k" }]),
  rules: x === "k" ? [] : [{ id: "noFlap", when: "!startNext", action: "hide" }],
});
const endHole = (x: Expr, y: Expr): Node => ({
  ...path("endHole", "cut", [x, y], [{ type: "arc", x: "edge", y: "-c", radius: "k" }]),
  rules: x === "edge - k" ? [] : [{ id: "noFlap", when: "!endNext", action: "hide" }],
});

/**
 * The snap lock (1-2-3) bottom: four flaps that fold in order and lock without
 * glue. Each flap meets its opposite in the middle of the box, S / 2 deep, and
 * runs on past it; there the back flap's tab enters the front flap's notch.
 * Past the middle the board flexes into the box, so the tab and the prongs beside
 * the notch end behind the opposite flap: the `bend` lines, which only the 3D reads.
 */
const LOCK_VARIABLES = [
  ...RELIEF_VARIABLES,
  { name: "S", expr: "min(length, width)" },
  { name: "L", expr: "max(length, width)" },
  // 0 on a long bottom, 1 on a square one: proportions shift between the two.
  { name: "nearSquare", expr: "max(0, S / L - 0.75) * 4" },
  { name: "d", expr: "S / 2 + (depth > 0 ? depth : S * (0.25 - 0.03 * nearSquare))" },
  // Tips are nearly sharp on a long bottom and rounded generously on a square one.
  { name: "rt", expr: "min(k * 2, S / 8) + nearSquare * S * 0.05" },
  // On a square box the faces are as wide as the sides: the tab keeps a third.
  { name: "tw", expr: "max(edge - S, edge / 3)" },
];
const lockParams = [auto("depth", "Overlap past the middle")];

export const snapLockNotched: ComponentDef = {
  id: "lib:snapLockNotched",
  name: "Snap lock: notched flap",
  category: "Locks",
  description: "Snap lock bottom, wide panel: a full flap with a notch that takes the tab of the opposite flap.",
  edge: { hinge: "none", relief: true, straight: "both" },
  params: lockParams,
  variables: [...LOCK_VARIABLES, { name: "n", expr: "(edge - tw) / 2 - k" }],
  nodes: [
    path("outline", "cut", STRAIGHT_START, [
      to("k", "d"),
      to("n", "d", "rt"),
      to("n", "S / 2"),
      to("edge - n", "S / 2"),
      to("edge - n", "d", "rt"),
      to("edge - k", "d"),
      STRAIGHT_END,
    ]),
    startHole("k", "c"),
    endHole("edge - k", "c"),
    line("hinge", "crease", ["hx", "0"], ["edge - hx", "0"]),
    line("startProng", "bend", ["k", "S / 2"], ["n", "S / 2"]),
    line("endProng", "bend", ["edge - n", "S / 2"], ["edge - k", "S / 2"]),
  ],
};

export const snapLockTab: ComponentDef = {
  id: "lib:snapLockTab",
  name: "Snap lock: tab flap",
  category: "Locks",
  description: "Snap lock bottom, wide panel: slopes in from both folds to a tab that enters the opposite notch.",
  edge: { hinge: "none", relief: true },
  params: lockParams,
  variables: [...LOCK_VARIABLES, { name: "m", expr: "(edge - tw) / 2" }],
  nodes: [
    path("outline", "cut", SLOPED_START, [to("m", "S / 2"), to("m", "d", "rt"), to("edge - m", "d", "rt"), to("edge - m", "S / 2"), SLOPED_END]),
    startHole("tx", "ty"),
    endHole("edge - tx", "ty"),
    line("hinge", "crease", ["startNext ? hx : 0", "0"], ["edge - (endNext ? hx : 0)", "0"]),
    line("tongue", "bend", ["m", "S / 2"], ["edge - m", "S / 2"]),
  ],
};

export const snapLockSide: ComponentDef = {
  id: "lib:snapLockSide",
  name: "Snap lock: side flap",
  category: "Locks",
  description: "Snap lock bottom, narrow panel: slopes in from the start of the edge to a tab along the end. Flip it for the other side panel.",
  edge: { hinge: "none", relief: true, straight: "end" },
  params: [...lockParams, { name: "wedge", label: "Tab edge: -1 widens to a barb, 1 narrows, 0 straight", default: 0, min: -1, max: 1 }],
  variables: [
    ...LOCK_VARIABLES,
    // Past the middle of the flap, so the barb hooks well behind the notch's floor.
    { name: "m", expr: "edge / 2 - S * 0.02" },
    // The barb stays crisp: a big radius would take away what it grips with.
    { name: "barb", expr: "min(k * 2, S / 8)" },
    // Level with the other flaps on a long bottom. Nearer square the two side flaps
    // would collide, so they stop 3% of the long side short of the middle.
    { name: "reach", expr: "depth > 0 ? d : min(d, L * 0.47)" },
    // Where the slope ends: half the panel, or a shallower slope on a short reach.
    { name: "sy", expr: "min(edge / 2, reach * 0.7)" },
    // The tab widens towards its tip into a barb that holds the bottom shut.
    { name: "lean", expr: "wedge * (reach - sy) * 0.2" },
  ],
  nodes: [
    path("outline", "cut", SLOPED_START, [to("m", "sy"), to("m + lean", "reach", "barb"), to("edge - k", "reach"), STRAIGHT_END]),
    startHole("tx", "ty"),
    endHole("edge - k", "c"),
    line("hinge", "crease", ["startNext ? hx : 0", "0"], ["edge - hx", "0"]),
  ],
};

/**
 * The auto-lock (crash-lock) bottom: two main flaps carry a triangle that is
 * glued to the side flap beside it, so the bottom opens by itself when the flat
 * carton is squared up. Both flaps are drawn left to right as seen on a bottom
 * edge, which is the far end first in the edge frame: flip them there.
 */
export const autoLockMain: ComponentDef = {
  id: "lib:autoLockMain",
  name: "Auto-lock: main flap",
  category: "Locks",
  description: "Auto-lock bottom, wide panel: a flap past the middle of the box, with a step and a folding glue triangle at the end of the edge.",
  edge: { hinge: "none", relief: true, straight: "start" },
  params: [auto("depth", "Overlap past the middle")],
  variables: [
    ...RELIEF_VARIABLES,
    { name: "S", expr: "min(length, width)" },
    { name: "s", expr: "S / 2" },
    { name: "o", expr: "depth > 0 ? depth : S * 0.29" },
    { name: "d", expr: "s + o" },
    // The free side leans in, so it clears the opposite flap when it closes.
    { name: "lean", expr: "S * 0.085" },
    // The step in the far edge is a chamfer that ends on the middle of the panel.
    { name: "ch", expr: "min(o * 0.8, edge / 2 - k - lean - 1)" },
    // The triangle's fold runs at 45° from the apex to the notch at the panel fold.
    { name: "ax", expr: "max(edge - s, edge / 2 + 1)" },
    { name: "ay", expr: "edge - ax" },
    { name: "rt", expr: "min(k * 2, o / 4)" },
    // The glue area keeps a margin inside the triangle; `gd` is that margin
    // measured along an axis from the 45° edges.
    { name: "gm", expr: "min(k, o / 6)" },
    { name: "gd", expr: "gm * sqrt(2)" },
  ],
  nodes: [
    path("outline", "cut", STRAIGHT_START, [
      to("k + lean", "d"),
      to("edge / 2 - ch", "d"),
      to("edge / 2", "d - ch", "k"),
      to("edge / 2", "ay"),
      to("ax", "ay"),
      to("ax + o", "ay + o"),
      to("edge - k", "ay + o", "rt"),
      to("edge - k", "4.7 * k"),
      to("edge - 3.5 * k", "2.2 * k"),
      SLOPED_END,
    ]),
    startHole("k", "c"),
    endHole("edge - tx", "ty"),
    line("hinge", "crease", ["hx", "0"], ["edge - (endNext ? hx : 0)", "0"]),
    line("triangleFold", "crease", ["ax", "ay"], ["edge - 2.85 * k", "2.85 * k"]),
    path(
      "glueArea",
      "glue",
      ["ax + gd", "ay"],
      [
        to("ax + o - gm + gd", "ay + o - gm"),
        to("edge - k - gm - rt / 2", "ay + o - gm"),
        to("edge - k - gm", "ay + o - gm - rt / 2"),
        to("edge - k - gm", "4.7 * k - gm + gd"),
        to("edge - 2.85 * k", "2.85 * k + gd"),
      ],
      true,
    ),
  ],
};

export const autoLockSide: ComponentDef = {
  id: "lib:autoLockSide",
  name: "Auto-lock: side flap",
  category: "Locks",
  description: "Auto-lock bottom, narrow panel: reaches the middle of the box, and the main flap's triangle is glued on it.",
  edge: { hinge: "none", relief: true, straight: "start" },
  params: [],
  variables: [...RELIEF_VARIABLES, { name: "s", expr: "edge / 2" }],
  nodes: [
    path("outline", "cut", STRAIGHT_START, [to("max(k + 1, edge * 0.22)", "s"), to("s", "s"), SLOPED_END]),
    startHole("k", "c"),
    endHole("edge - tx", "ty"),
    line("hinge", "crease", ["hx", "0"], ["edge - (endNext ? hx : 0)", "0"]),
  ],
};

/**
 * The gable top: on each wide panel a roof half as deep as the box, so the two
 * meet in the middle, then a handle flap that stands up, doubled with its opposite.
 * Rounded ears and a slot for the hand finish the flap.
 */
export const gableRoof: ComponentDef = {
  id: "lib:gableRoof",
  name: "Gable roof with handle",
  category: "Closures",
  description: "Wide panel of a gable carton: a roof to the middle of the box and a handle flap with a hand slot.",
  edge: { hinge: "crease" },
  params: [auto("roof", "Roof depth"), auto("handle", "Handle flap height")],
  variables: [
    { name: "S", expr: "min(length, width)" },
    { name: "r", expr: "roof > 0 ? roof : S / 2" },
    { name: "h", expr: "handle > 0 ? handle : S / 2" },
    // Rounded ears at the ends, then a step up to the flat top.
    { name: "a", expr: "min(edge * 0.1, h * 0.4)" },
    { name: "ey", expr: "r + h * 0.72" },
    { name: "g", expr: "h * 0.22" },
    // The hand slot, in the middle of the flap's width.
    { name: "cx", expr: "edge / 2" },
    { name: "sh", expr: "h * 0.36" },
    { name: "sw", expr: "max(edge * 0.3, sh * 2.2)" },
    { name: "sr", expr: "sh / 2" },
    { name: "sy", expr: "r + h * 0.3" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [
      to("0", "ey"),
      { type: "arc", x: "a", y: "ey", radius: "a / 2", clockwise: true },
      to("a + g", "r + h"),
      to("edge - a - g", "r + h"),
      to("edge - a", "ey"),
      { type: "arc", x: "edge", y: "ey", radius: "a / 2", clockwise: true },
      to("edge", "0"),
    ]),
    line("roofFold", "crease", ["0", "r"], ["edge", "r"]),
    path(
      "handSlot",
      "cut",
      ["cx - sw / 2 + sr", "sy"],
      [
        to("cx + sw / 2 - sr", "sy"),
        { type: "arc", x: "cx + sw / 2 - sr", y: "sy + sh", radius: "sr" },
        to("cx - sw / 2 + sr", "sy + sh"),
        { type: "arc", x: "cx - sw / 2 + sr", y: "sy", radius: "sr" },
      ],
      true,
    ),
  ],
};

/** The gable's end: a rounded triangle under the roofs, with a slit so it tucks in. */
export const gableGusset: ComponentDef = {
  id: "lib:gableGusset",
  name: "Gable gusset",
  category: "Closures",
  description: "Narrow panel of a gable carton: a rounded triangle with a slit up its middle, closed under the roofs.",
  edge: { hinge: "crease" },
  params: [auto("peak", "Height")],
  variables: [
    { name: "a", expr: "peak > 0 ? peak : edge * 0.62" },
    { name: "rd", expr: "edge * 0.12" },
    { name: "cx", expr: "edge / 2" },
    { name: "sw", expr: "max(1.5, thickness * 2)" },
    { name: "sl", expr: "a * 0.62" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [to("cx", "a", "rd"), to("edge", "0")]),
    path(
      "slit",
      "cut",
      ["cx + sw / 2", "sw"],
      [
        to("cx + sw / 2", "sl"),
        { type: "arc", x: "cx - sw / 2", y: "sl", radius: "sw / 2" },
        to("cx - sw / 2", "sw"),
        { type: "arc", x: "cx + sw / 2", y: "sw", radius: "sw / 2" },
      ],
      true,
    ),
  ],
};

/**
 * The keyboard box (جعبه کیبوردی): a mailer that locks itself. Its double side walls
 * are the body's panels; these are its edges. Every size here is taken from a real
 * die (315 × 202 × 62 on 3 mm board): lengths that follow the board are written
 * in `thickness`, shapes in the box height, so that die is reproduced exactly.
 * The tabs follow the box's depth, so each count has its own nodes, shown by a rule.
 */
const KEYBOARD_VARIABLES = [
  { name: "W", expr: "min(length, width)" },
  { name: "h", expr: "height" },
  { name: "tabs", expr: "count > 0 ? count : clamp(round(W / 120), 1, 5)" },
  { name: "tw", expr: "18.6 + W * 0.086", description: "Tab length at its tip; its base is a board longer" },
  // Half a board, at least 0.25 mm: the radius of every relief where two flaps fold side by side.
  { name: "rr", expr: "max(0.25, thickness / 2)" },
  { name: "sw", expr: "thickness + 2", description: "Slot width" },
];
const keyboardCount = [{ name: "count", label: "Tabs on each side (0 = auto)", default: 0, min: 0, max: 5, step: 1, unit: "count" as const }];
const KEYBOARD_COUNTS = [1, 2, 3, 4, 5];
const countRule = (k: number) => [{ id: "count", when: `tabs != ${k}`, action: "hide" as const }];
/** Tab centres along the depth, from the far end. */
const tabCentres = (k: number) => Array.from({ length: k }, (_, i) => `W / 2 + (${(k - 1) / 2 - i}) * W / ${k + 0.525}`);

/**
 * One slot along a side fold of the base, which runs from y = 0 down to -W here:
 * as wide as `sw`, fully round at both ends, two millimetres longer than the tab's
 * tip at each end. Its outer side lies on the fold.
 */
const keyboardSlot = (name: string, x0: Expr, x1: Expr, c: Expr, clockwise: boolean, k: number): Node => {
  const y0 = `-(${c}) - tw / 2 - 2 + sw / 2`;
  const y1 = `-(${c}) + tw / 2 + 2 - sw / 2`;
  return {
    ...path(name, "cut", [x0, y0], [
      { type: "arc", x: x1, y: y0, radius: "sw / 2", clockwise },
      to(x1, y1),
      { type: "arc", x: x0, y: y1, radius: "sw / 2", clockwise },
    ], true),
    rules: countRule(k),
  };
};

/** Back wall, lid and everything on it, on the base's back edge; also cuts the base's slots. */
export const keyboardLid: ComponentDef = {
  id: "lib:keyboardLid",
  name: "Keyboard box: lid",
  category: "Keyboard box",
  description: "Back wall with end flaps, the lid with its side flaps, and a tuck with round ears. Cuts the slots along the base.",
  edge: { hinge: "none" },
  params: keyboardCount,
  variables: [
    ...KEYBOARD_VARIABLES,
    // Folds in from the base's corners: the back wall's end flaps and the tuck's
    // ears half a board, the lid's side flaps 3.5 mm further.
    { name: "a", expr: "rr" },
    { name: "b", expr: "a + 3.5" },
    { name: "f", expr: "h * 1.306", description: "End flap reach from its fold" },
    { name: "Y1", expr: "h", description: "Lid hinge" },
    { name: "Y2", expr: "Y1 + W + rr", description: "Lid front fold" },
    { name: "Y3", expr: "Y2 + h", description: "Tuck's top edge" },
    // Where an end flap or an ear meets a lid side flap beside the lid's folds, the
    // cut turns through a small half circle that just touches the side flap's fold.
    { name: "rl", expr: "max(0.25, thickness * 0.4)" },
    { name: "dl", expr: "rl * 0.17" },
    { name: "lf", expr: "h - rr", description: "Lid side flap reach from its fold" },
    { name: "lfs", expr: "min(lf * 0.381, W * 0.3)", description: "Where its slope meets its side" },
    { name: "lr", expr: "min(lf * 0.248, W * 0.12)", description: "Its corner rounds" },
    // The tuck's ears, as on the die: a step down from the tuck's top edge, a
    // quarter ellipse out to the ear's widest point (flat where it meets the
    // step, upright at the widest point), a short upright, and a round corner into
    // a straight foot just above the lid front fold. The ellipse is drawn as two
    // circular arcs that meet smoothly, within 0.2 mm of it.
    // 2.5 mm on the die (h = 62), in proportion to the box.
    { name: "st", expr: "h * 0.0403" },
    { name: "e", expr: "h * 0.8363", description: "Ear reach from its fold" },
    { name: "eb", expr: "h * 0.729", description: "Ellipse height" },
    { name: "er", expr: "h * 0.2097", description: "Round corner into the foot" },
    { name: "eFy", expr: "Y2 - dl + rl", description: "The ear's foot" },
    { name: "Yc", expr: "max(Y3 - st - eb, eFy + er)", description: "Height of the ear's widest point" },
    { name: "eh", expr: "Y3 - st - Yc" },
    { name: "r2", expr: "eh * 0.91" },
    { name: "r1", expr: "((e - r2) ^ 2 + eh ^ 2 - r2 ^ 2) / (2 * (eh - r2))" },
    { name: "jx", expr: "(e - r2) * r1 / (r1 - r2)", description: "Where the two arcs meet, out from the fold" },
    { name: "jy", expr: "Yc + (eh - r1) + (r1 - eh) * r1 / (r1 - r2)" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [
      // Relief at the base corner, then the end flap, one board off the base fold.
      { type: "arc", x: "0", y: "2 * rr", radius: "rr" },
      to("a - f", "2 * rr"),
      to("a - f", "Y1 + dl - rl"),
      to("b - rl", "Y1 + dl - rl"),
      { type: "arc", x: "b - rl", y: "Y1 + dl + rl", radius: "rl" },
      // The lid's side flap.
      to("b - lf", "Y1 + lfs", "lr"),
      to("b - lf", "Y2 - lfs", "lr"),
      to("b - rl", "Y2 - dl - rl"),
      { type: "arc", x: "b - rl", y: "Y2 - dl + rl", radius: "rl" },
      // The tuck's ear, the tuck, the other ear.
      to("a - e", "eFy", "er"),
      to("a - e", "Yc"),
      { type: "arc", x: "a - jx", y: "jy", radius: "r2", clockwise: true },
      { type: "arc", x: "a", y: "Y3 - st", radius: "r1", clockwise: true },
      to("a + st", "Y3"),
      to("edge - a - st", "Y3"),
      to("edge - a", "Y3 - st"),
      { type: "arc", x: "edge - a + jx", y: "jy", radius: "r1", clockwise: true },
      { type: "arc", x: "edge - a + e", y: "Yc", radius: "r2", clockwise: true },
      to("edge - a + e", "eFy", "er"),
      to("edge - b + rl", "eFy"),
      { type: "arc", x: "edge - b + rl", y: "Y2 - dl - rl", radius: "rl" },
      to("edge - b + lf", "Y2 - lfs", "lr"),
      to("edge - b + lf", "Y1 + lfs", "lr"),
      to("edge - b + rl", "Y1 + dl + rl"),
      { type: "arc", x: "edge - b + rl", y: "Y1 + dl - rl", radius: "rl" },
      to("edge - a + f", "Y1 + dl - rl"),
      to("edge - a + f", "2 * rr"),
      to("edge", "2 * rr"),
      { type: "arc", x: "edge", y: "0", radius: "rr" },
    ]),
    // The base fold runs corner to corner; the others end where their flaps' cuts meet them.
    line("hinge", "crease", ["0", "0"], ["edge", "0"]),
    line("lidHinge", "crease", ["b", "Y1"], ["edge - b", "Y1"]),
    line("lidFront", "crease", ["b", "Y2"], ["edge - b", "Y2"]),
    line("backFlapStart", "crease", ["a", "rr"], ["a", "Y1 + dl - rl"]),
    line("backFlapEnd", "crease", ["edge - a", "rr"], ["edge - a", "Y1 + dl - rl"]),
    line("lidFlapStart", "crease", ["b", "Y1"], ["b", "Y2"]),
    line("lidFlapEnd", "crease", ["edge - b", "Y1"], ["edge - b", "Y2"]),
    line("earStart", "crease", ["a", "Y2 - dl + rl"], ["a", "Y3 - st"]),
    line("earEnd", "crease", ["edge - a", "Y2 - dl + rl"], ["edge - a", "Y3 - st"]),
    ...KEYBOARD_COUNTS.flatMap((k) =>
      tabCentres(k).flatMap((c, i) => [
        // Wholly on the base, the outer side on the fold, so the inner wall's tab
        // drops in right against the wall.
        keyboardSlot(`slotStart${k}${i}`, "sw", "0", c, true, k),
        keyboardSlot(`slotEnd${k}${i}`, "edge - sw", "edge", c, false, k),
      ]),
    ),
  ],
};

/** The front wall, with an end flap on each side, on the base's front edge. */
export const keyboardFront: ComponentDef = {
  id: "lib:keyboardFront",
  name: "Keyboard box: front wall",
  category: "Keyboard box",
  description: "Front wall with an end flap on each side, which fold in behind the side walls.",
  edge: { hinge: "none" },
  params: [],
  variables: [
    { name: "h", expr: "height" },
    { name: "rr", expr: "max(0.25, thickness / 2)" },
    // A millimetre further in than the back wall's, and half a board lower than the box.
    { name: "a", expr: "rr + 1" },
    { name: "hf", expr: "h - rr", description: "Front wall height" },
    { name: "f", expr: "h * 1.306" },
  ],
  nodes: [
    path("outline", "cut", ["0", "0"], [
      // The relief just touches the end flap's fold; the flap stands one board off the base fold.
      to("a - rr", "0"),
      { type: "arc", x: "a - rr", y: "2 * rr", radius: "rr" },
      to("a - f", "2 * rr"),
      to("a - f", "hf"),
      to("edge - a + f", "hf"),
      to("edge - a + f", "2 * rr"),
      to("edge - a + rr", "2 * rr"),
      { type: "arc", x: "edge - a + rr", y: "0", radius: "rr" },
      to("edge", "0"),
    ]),
    // Stops at the reliefs, so no cut runs along it.
    line("hinge", "crease", ["a - rr", "0"], ["edge - a + rr", "0"]),
    line("flapStart", "crease", ["a", "rr"], ["a", "hf"]),
    line("flapEnd", "crease", ["edge - a", "rr"], ["edge - a", "hf"]),
  ],
};

/** The inner wall's free edge, with the tabs that enter the base's slots. */
export const keyboardTabs: ComponentDef = {
  id: "lib:keyboardTabs",
  name: "Keyboard box: tabs",
  category: "Keyboard box",
  description: "Edge of the inner wall, with tabs that lock into the slots along the base. Their number follows the depth.",
  edge: { hinge: "none" },
  params: keyboardCount,
  variables: [...KEYBOARD_VARIABLES, { name: "td", expr: "max(2.5, thickness * 1.25)", description: "Tab depth" }],
  nodes: KEYBOARD_COUNTS.map((k) => ({
    ...path(
      `edge${k}`,
      "cut",
      ["startInset", "0"],
      [
        ...[...tabCentres(k)].reverse().flatMap((c) => [
          to(`${c} - tw / 2 - rr`, "0"),
          to(`${c} - tw / 2`, "td"),
          to(`${c} + tw / 2`, "td"),
          to(`${c} + tw / 2 + rr`, "0"),
        ]),
        to("edge - endInset", "0"),
      ],
    ),
    rules: countRule(k),
  })),
};

export const LIBRARY: ComponentDef[] = [tuckLid, dustFlap, glueFlap, slottedFlap, plainFlap, snapLockNotched, snapLockTab, snapLockSide, autoLockMain, autoLockSide, thumbNotch, gableRoof, gableGusset, keyboardLid, keyboardFront, keyboardTabs];

export const EDGE_COMPONENTS = LIBRARY.filter((c) => c.edge);
