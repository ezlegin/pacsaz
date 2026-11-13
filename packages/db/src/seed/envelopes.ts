import { emptyDocument, type DielineDocument, type Node, type Ruler, type Segment } from "../../../dieline-engine/src/spec/types";
import type { CardTemplate } from "./cards";

/**
 * Envelopes and the pillow box, after Pacdora's Envelopes and Folding Boxes
 * ranges. Envelopes are sized by the pocket (`width` across, `length` up): the
 * flaps follow from it. The pillow box is `width` across each face, `length`
 * long and `height` deep at the middle.
 */

const to = (x: string, y: string, round?: string): Segment => ({ type: "to", x, y, ...(round ? { round } : {}) });

const ruler = (name: string, from: [string, string], to: [string, string]): Ruler => ({
  id: name,
  name,
  from: { x: from[0], y: from[1] },
  to: { x: to[0], y: to[1] },
  offset: "0",
});

const fold = (name: string, from: [string, string], to: [string, string]): Node => ({
  id: name,
  name,
  kind: "line",
  lineType: "crease",
  from: { x: from[0], y: from[1] },
  to: { x: to[0], y: to[1] },
});

/** The pocket's four folds, corner to corner. */
const pocketFolds = (): Node[] => [
  fold("bottomFold", ["0", "0"], ["width", "0"]),
  fold("rightFold", ["width", "0"], ["width", "length"]),
  fold("topFold", ["width", "length"], ["0", "length"]),
  fold("leftFold", ["0", "length"], ["0", "0"]),
];

const pocketRulers = (): Ruler[] => [
  ruler("widthRuler", ["0", "length / 2"], ["width", "length / 2"]),
  ruler("lengthRuler", ["width / 2", "0"], ["width / 2", "length"]),
];

/**
 * Pacdora's A6 business envelope: four pointed flaps round the pocket, as on a
 * diamond-cut blank. The side flaps meet under the bottom flap, which reaches
 * past the middle so the top flap closes over it.
 */
const diamondEnvelope: DielineDocument = {
  ...emptyDocument(),
  variables: [
    { name: "side", expr: "width * 0.3", description: "Side flaps' reach" },
    { name: "bottom", expr: "length * 0.6", description: "Bottom flap's reach, past the middle" },
    { name: "top", expr: "length * 0.55", description: "Top (sealing) flap's reach" },
    { name: "tip", expr: "min(width, length) * 0.06", description: "Rounding on each flap's point" },
  ],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "0", y: "0" },
      segments: [
        to("width / 2", "-bottom", "tip"),
        to("width", "0"),
        to("width + side", "length / 2", "tip"),
        to("width", "length"),
        to("width / 2", "length + top", "tip"),
        to("0", "length"),
        to("-side", "length / 2", "tip"),
      ],
    },
    ...pocketFolds(),
  ],
  rulers: pocketRulers(),
};

/**
 * Pacdora's letter (wallet) envelope: narrow tapered side flaps, a deep bottom
 * flap with sloped shoulders that glues over them, and a rounded top flap. The
 * side flaps stop a board's breadth short of the corners so the flaps beside
 * them fold without binding.
 */
const walletEnvelope: DielineDocument = {
  ...emptyDocument(),
  variables: [
    { name: "gap", expr: "max(1, thickness * 3)", description: "Side flaps stop short of the corners" },
    { name: "side", expr: "min(clamp(width * 0.12, 8, 25), (length - 2 * gap) * 0.4)", description: "Side flaps' reach; their tapers never meet on a short envelope" },
    { name: "bottom", expr: "length * 0.62", description: "Bottom flap's reach" },
    { name: "top", expr: "length * 0.4", description: "Top flap's reach" },
    { name: "rr", expr: "min(width * 0.12, top * 0.5)", description: "Top flap's corner rounding" },
  ],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "0", y: "0" },
      segments: [
        to("side * 0.8", "-bottom", "side * 0.4"),
        to("width - side * 0.8", "-bottom", "side * 0.4"),
        to("width", "0"),
        to("width", "gap"),
        to("width + side", "gap + side", "side * 0.3"),
        to("width + side", "length - gap - side", "side * 0.3"),
        to("width", "length - gap"),
        to("width", "length"),
        to("width - side * 0.3", "length + top", "rr"),
        to("side * 0.3", "length + top", "rr"),
        to("0", "length"),
        to("0", "length - gap"),
        to("-side", "length - gap - side", "side * 0.3"),
        to("-side", "gap + side", "side * 0.3"),
        to("0", "gap"),
      ],
    },
    // The side folds run only along the side flaps: beside the corners the edge is cut.
    fold("bottomFold", ["0", "0"], ["width", "0"]),
    fold("rightFold", ["width", "gap"], ["width", "length - gap"]),
    fold("topFold", ["width", "length"], ["0", "length"]),
    fold("leftFold", ["0", "length - gap"], ["0", "gap"]),
  ],
  rulers: pocketRulers(),
};

/**
 * The pillow box: two faces and a glue flap; at each end a curved crease and
 * the cut curving the other way make the lens-shaped end flaps that fold in
 * and close it without glue. The curve's depth (sagitta) is half the box's
 * depth, so the folded ends meet in the middle.
 */
const lens = (name: string, x0: string, x1: string, y: string, outward: "up" | "down"): Node => ({
  id: name,
  name,
  kind: "path",
  lineType: "crease",
  closed: false,
  start: { x: x0, y },
  // Left to right, bowing up is clockwise; the crease bows into the face.
  segments: [{ type: "arc", x: x1, y, radius: "R", clockwise: outward === "up" }],
});
const pillowBox: DielineDocument = {
  ...emptyDocument(),
  variables: [
    { name: "s", expr: "min(height / 2, width * 0.3)", description: "How far each end's curve bows: half the box's depth" },
    { name: "R", expr: "(width ^ 2 / 4 + s ^ 2) / (2 * s)", description: "Radius of the end curves" },
    { name: "glue", expr: "clamp(width * 0.12, 10, 20)", description: "Glue flap" },
  ],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "0", y: "0" },
      segments: [
        { type: "arc", x: "width", y: "0", radius: "R" },
        { type: "arc", x: "2 * width", y: "0", radius: "R" },
        to("2 * width", "length"),
        { type: "arc", x: "width", y: "length", radius: "R" },
        { type: "arc", x: "0", y: "length", radius: "R" },
        to("-glue", "length - glue * 0.6"),
        to("-glue", "glue * 0.6"),
      ],
    },
    fold("glueFold", ["0", "0"], ["0", "length"]),
    fold("sideFold", ["width", "0"], ["width", "length"]),
    lens("end1", "0", "width", "0", "up"),
    lens("end2", "width", "2 * width", "0", "up"),
    lens("end3", "0", "width", "length", "down"),
    lens("end4", "width", "2 * width", "length", "down"),
  ],
  rulers: [
    ruler("widthRuler", ["0", "length / 2"], ["width", "length / 2"]),
    ruler("lengthRuler", ["width * 1.5", "0"], ["width * 1.5", "length"]),
  ],
};

const PAPER = ["artPaper", "glossyCardboard"];

export const ENVELOPE_TEMPLATES: CardTemplate[] = [
  {
    slug: "diamond-envelope",
    title: "پاکت لوزی",
    description:
      "پاکت کلاسیک با چهار لبه‌ی نوک‌تیز که از یک برش لوزی‌شکل تا می‌شود؛ لبه‌های کناری زیر لبه‌ی پایین چسب می‌خورند و لبه‌ی بالا پاکت را می‌بندد.\nبرای کارت دعوت، کارت تبریک، کارت هدیه و نامه‌های رسمی مناسب است. اندازه‌ها اندازه‌ی جیب پاکت است.",
    doc: diamondEnvelope,
    size: { width: 162, length: 114, height: 0 },
    min: { width: 60, length: 40, height: 0 },
    max: { width: 330, length: 250, height: 0 },
    materials: PAPER,
    bleed: 3,
  },
  {
    slug: "wallet-envelope",
    title: "پاکت نامه کیفی",
    description:
      "پاکت نامه‌ی اداری با لبه‌ی پایینی پهن که روی دو لبه‌ی کناری باریک چسب می‌خورد، و لبه‌ی بالایی گرد برای بستن. لبه‌های کناری کمی کوتاه‌تر از گوشه‌ها تمام می‌شوند تا تاها روی هم گیر نکنند.\nبرای نامه، فاکتور، بروشور و کارت‌های تبلیغاتی مناسب است.",
    doc: walletEnvelope,
    size: { width: 220, length: 110, height: 0 },
    min: { width: 80, length: 50, height: 0 },
    max: { width: 330, length: 250, height: 0 },
    materials: PAPER,
    bleed: 3,
  },
  {
    slug: "pillow-box",
    title: "جعبه بالشتی",
    description:
      "جعبه‌ی بالشتی با دو سر خمیده که بدون چسب بسته می‌شوند: خط تای منحنی هر سر به داخل فشار داده می‌شود و دو لبه‌ی هلالی روی هم می‌خوابند. فقط یک خط چسب کناری دارد و تخت ارسال می‌شود.\nبرای هدیه‌های کوچک، زیورآلات، شکلات، صابون و بسته‌های تبلیغاتی رایج است. عمق، ضخامت جعبه در میانه است.",
    doc: pillowBox,
    size: { width: 90, length: 160, height: 30 },
    min: { width: 50, length: 60, height: 10 },
    max: { width: 200, length: 350, height: 80 },
    materials: ["glossyCardboard", "artPaper"],
    bleed: 3,
  },
];
