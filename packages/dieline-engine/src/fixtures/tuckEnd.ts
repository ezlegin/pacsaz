import type { DielineDocument, Expr, LineNode, PathNode, RectNode, Segment } from "../spec/types";

/**
 * Reverse tuck end (RTE) carton, written by hand in the v2 format.
 *
 * It is a reference for the format and a test fixture, not a production
 * template: Phase 4 replaces the hand-written flaps with edge-attached
 * components. It shows the intended authoring style: panels are guides placed
 * relative to each other, and everything else is drawn from their anchors, so
 * changing `width` or `length` moves every dependent line.
 *
 * Panel order, left to right: front (length), side, back (length), side, glue.
 * The top closure hangs off the back panel, the bottom closure off the front.
 */

const guide = (name: string, width: Expr, x: Expr): RectNode => ({
  id: name,
  name,
  kind: "rect",
  lineType: "guide",
  width,
  height: "height",
  transform: { x, y: "0" },
});

const crease = (name: string, from: [Expr, Expr], to: [Expr, Expr]): LineNode => ({
  id: name,
  name,
  kind: "line",
  lineType: "crease",
  from: { x: from[0], y: from[1] },
  to: { x: to[0], y: to[1] },
});

const to = (x: Expr, y: Expr, round?: Expr): Segment =>
  round ? { type: "to", x, y, round } : { type: "to", x, y };

const outline: PathNode = {
  id: "outline",
  name: "outline",
  kind: "path",
  lineType: "cut",
  closed: true,
  start: { x: "@front.bottomLeft.x", y: "@front.bottomLeft.y" },
  segments: [
    to("@front.topLeft.x", "@front.topLeft.y"),
    to("@front.topRight.x", "@front.topRight.y"),

    // Top dust flap on the first side panel.
    to("@side1.topLeft.x + dustInset", "height + dust", "dustRound"),
    to("@side1.topRight.x - dustShoulder", "height + dust", "dustRound"),
    // Pulled off the fold line so it does not run along the lid's cut edge.
    to("@side1.topRight.x - dustInset", "height + dust / 2"),
    to("@side1.topRight.x", "height"),

    // Top closure on the back panel, with its tuck flap.
    to("@back.topLeft.x", "height + width"),
    to("@back.topLeft.x + tuckInset", "height + width + tuck", "tuckRound"),
    to("@back.topRight.x - tuckInset", "height + width + tuck", "tuckRound"),
    to("@back.topRight.x", "height + width"),
    to("@back.topRight.x", "height"),

    // Top dust flap on the second side panel (mirror of the first).
    to("@side2.topLeft.x + dustInset", "height + dust / 2"),
    to("@side2.topLeft.x + dustShoulder", "height + dust", "dustRound"),
    to("@side2.topRight.x - dustInset", "height + dust", "dustRound"),
    to("@side2.topRight.x", "height"),

    // Glue flap, tapered so it clears the closures.
    to("@side2.topRight.x + glue", "height - glueTaper"),
    to("@side2.topRight.x + glue", "glueTaper"),
    to("@side2.bottomRight.x", "0"),

    // Bottom dust flap on the second side panel.
    to("@side2.bottomRight.x - dustInset", "-dust", "dustRound"),
    to("@side2.bottomLeft.x + dustShoulder", "-dust", "dustRound"),
    to("@side2.bottomLeft.x + dustInset", "-dust / 2"),
    to("@side2.bottomLeft.x", "0"),

    // The back panel has no bottom flap.
    to("@back.bottomLeft.x", "0"),

    // Bottom dust flap on the first side panel.
    to("@side1.bottomRight.x - dustInset", "-dust / 2"),
    to("@side1.bottomRight.x - dustShoulder", "-dust", "dustRound"),
    to("@side1.bottomLeft.x + dustInset", "-dust", "dustRound"),
    to("@side1.bottomLeft.x", "0"),

    // Bottom closure on the front panel, with its tuck flap.
    to("@front.bottomRight.x", "-width"),
    to("@front.bottomRight.x - tuckInset", "-width - tuck", "tuckRound"),
    to("@front.bottomLeft.x + tuckInset", "-width - tuck", "tuckRound"),
    to("@front.bottomLeft.x", "-width"),
  ],
};

export const tuckEndBox: DielineDocument = {
  version: 2,
  params: [
    { name: "tuckDepth", label: "Tuck flap depth", default: 0, min: 0, max: 40, unit: "mm" },
  ],
  variables: [
    // Tuck flaps grow with the box, the way the old Door model sized them,
    // unless the designer sets the depth explicitly.
    {
      name: "tuck",
      expr: "11",
      cases: [
        { when: "tuckDepth > 0", expr: "tuckDepth" },
        { when: "width >= 180", expr: "25" },
        { when: "width >= 130", expr: "20" },
        { when: "width >= 100", expr: "15" },
        { when: "width >= 60", expr: "13" },
      ],
    },
    { name: "tuckInset", expr: "max(tuck * 0.15, 2)" },
    { name: "tuckRound", expr: "tuck * 0.6" },
    { name: "dust", expr: "min(length / 2, width) - thickness" },
    { name: "dustInset", expr: "2 * thickness" },
    { name: "dustShoulder", expr: "min(6, width / 4)" },
    { name: "dustRound", expr: "min(4, dust / 4)" },
    { name: "glue", expr: "clamp(height * 0.15, 12, 25)" },
    { name: "glueTaper", expr: "min(8, height / 6)" },
  ],
  nodes: [
    {
      id: "panels",
      name: "panels",
      kind: "group",
      children: [
        guide("front", "length", "0"),
        guide("side1", "width", "@front.right.x"),
        guide("back", "length", "@side1.right.x"),
        guide("side2", "width", "@back.right.x"),
      ],
    },
    outline,
    {
      id: "creases",
      name: "creases",
      kind: "group",
      children: [
        crease("foldFrontSide", ["@side1.bottomLeft.x", "0"], ["@side1.topLeft.x", "height"]),
        crease("foldSideBack", ["@back.bottomLeft.x", "0"], ["@back.topLeft.x", "height"]),
        crease("foldBackSide", ["@side2.bottomLeft.x", "0"], ["@side2.topLeft.x", "height"]),
        crease("foldGlue", ["@side2.bottomRight.x", "0"], ["@side2.topRight.x", "height"]),
        crease("foldTopDust1", ["@side1.topLeft.x", "height"], ["@side1.topRight.x", "height"]),
        crease("foldTopLid", ["@back.topLeft.x", "height"], ["@back.topRight.x", "height"]),
        crease("foldTopTuck", ["@back.topLeft.x", "height + width"], ["@back.topRight.x", "height + width"]),
        crease("foldTopDust2", ["@side2.topLeft.x", "height"], ["@side2.topRight.x", "height"]),
        crease("foldBottomLid", ["@front.bottomLeft.x", "0"], ["@front.bottomRight.x", "0"]),
        crease("foldBottomTuck", ["@front.bottomLeft.x", "-width"], ["@front.bottomRight.x", "-width"]),
        crease("foldBottomDust1", ["@side1.bottomLeft.x", "0"], ["@side1.bottomRight.x", "0"]),
        crease("foldBottomDust2", ["@side2.bottomLeft.x", "0"], ["@side2.bottomRight.x", "0"]),
      ],
    },
  ],
  rulers: [
    {
      id: "rulerWidth",
      name: "rulerWidth",
      from: { x: "@front.topLeft.x", y: "@front.topLeft.y" },
      to: { x: "@front.topRight.x", y: "@front.topRight.y" },
      offset: "8",
    },
  ],
  components: [],
};
