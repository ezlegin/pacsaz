import { emptyDocument, type DielineDocument, type Node, type Ruler, type Segment } from "../../../dieline-engine/src/spec/types";

/**
 * Flat cards and hang tags, after the shapes in Pacdora's "Cards & Tags" range
 * (one of each shape: the plain rectangles there, postcards, tickets and
 * invitations, are the same dieline at different sizes). `width` is across the
 * card and `length` up it; the hook tag and the label band also use `height`.
 * Each tag's string hole is sized by the tag and kept clear of every edge.
 */

type Size = { width: number; length: number; height: number };

export type CardTemplate = {
  slug: string;
  title: string;
  description: string;
  doc: DielineDocument;
  size: Size;
  min: Size;
  max: Size;
  materials: string[];
  bleed: number;
};

const CARD_MATERIALS = ["glossyCardboard", "artPaper"];

const to = (x: string, y: string, round?: string): Segment => ({ type: "to", x, y, ...(round ? { round } : {}) });

const ruler = (name: string, from: [string, string], to: [string, string]): Ruler => ({
  id: name,
  name,
  from: { x: from[0], y: from[1] },
  to: { x: to[0], y: to[1] },
  offset: "0",
});

const hole = (name: string, x: string, y: string, r = "holeR"): Node => ({
  id: name,
  name,
  kind: "ellipse",
  lineType: "cut",
  rx: r,
  ry: r,
  transform: { x, y },
});

const crease = (name: string, y: string): Node => ({
  id: name,
  name,
  kind: "line",
  lineType: "crease",
  from: { x: "0", y },
  to: { x: "width", y },
});

/** A string hole that grows with the tag but stays a punch size (4 to 7 mm across). */
const HOLE = { name: "holeR", expr: "clamp(min(width, length) * 0.05, 2, 3.5)", description: "String hole radius" };

/** Width across the bottom, length up the side: the two rulers every card shows. */
const cardRulers = (x0: string, x1: string, y0: string, y1: string): Ruler[] => [
  ruler("widthRuler", [x0, y0], [x1, y0]),
  ruler("lengthRuler", [x1, y0], [x1, y1]),
];

/** Pacdora 261083: a rectangle with both top corners cut off at 45°, hole between them. */
const bevelTag: DielineDocument = {
  ...emptyDocument(),
  variables: [HOLE, { name: "bevel", expr: "min(width * 0.22, length * 0.2)", description: "Corner cut, along each edge" }],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "0", y: "0" },
      segments: [to("width", "0"), to("width", "length - bevel"), to("width - bevel", "length"), to("bevel", "length"), to("0", "length - bevel")],
    },
    hole("hole", "width / 2", "length - bevel"),
  ],
  rulers: cardRulers("0", "width", "0", "length"),
};

/**
 * Pacdora 261030: two lobes of radius width / 4 meeting in a cusp, and straight
 * sides running from the point to where they touch the lobes, so the outline
 * has no kink. The tangent point comes from the tip's distance to a lobe centre.
 */
const heartTag: DielineDocument = {
  ...emptyDocument(),
  variables: [
    HOLE,
    { name: "r", expr: "min(width / 4, length * 0.45)", description: "Lobe radius; a card too short for its width gets a narrower heart" },
    { name: "cy", expr: "length - r", description: "Lobe centres' height" },
    { name: "d", expr: "sqrt(r ^ 2 + cy ^ 2)", description: "Tip to a lobe centre" },
    { name: "ang", expr: "atan2d(cy, r) - asind(r / d)", description: "Direction of the right side from the tip" },
    { name: "side", expr: "sqrt(d ^ 2 - r ^ 2)", description: "Length of each straight side" },
    { name: "tx", expr: "side * cosd(ang)" },
    { name: "ty", expr: "side * sind(ang)" },
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
        to("tx", "ty"),
        { type: "arc", x: "0", y: "cy", radius: "r", large: true },
        { type: "arc", x: "-tx", y: "ty", radius: "r", large: true },
      ],
    },
    hole("hole", "0", "cy - 3 * holeR"),
  ],
  rulers: cardRulers("-2 * r", "2 * r", "0", "length"),
};

/**
 * Pacdora 261040: five round petals. Each petal is an arc round its own centre
 * from where it crosses one neighbour to where it crosses the next; the crossing
 * points lie between the petals, `rho` from the middle.
 */
const petal = (k: number) => `${90 + 72 * k + 36}`;
const flowerTag: DielineDocument = {
  ...emptyDocument(),
  variables: [
    { name: "holeR", expr: "clamp(width * 0.03, 2, 3.5)", description: "String hole radius" },
    { name: "pr", expr: "width / 2 * 0.43", description: "Petal radius" },
    { name: "pd", expr: "width / 2 - pr", description: "Petal centres from the middle" },
    { name: "rho", expr: "pd * cosd(36) + sqrt(pr ^ 2 - (pd * sind(36)) ^ 2)", description: "Where neighbouring petals cross" },
  ],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "rho * cosd(54)", y: "rho * sind(54)" },
      segments: [0, 1, 2, 3, 4].map((k) => ({ type: "arc", x: `rho * cosd(${petal(k)})`, y: `rho * sind(${petal(k)})`, radius: "pr", large: true })),
    },
    hole("hole", "0", "pd + pr - 3 * holeR"),
  ],
  rulers: [ruler("widthRuler", ["-pd * cosd(18) - pr", "0"], ["pd * cosd(18) + pr", "0"])],
};

/** Pacdora 260040: a round card, or an oval one when width and length differ. */
const roundTag: DielineDocument = {
  ...emptyDocument(),
  variables: [HOLE],
  nodes: [
    { id: "outline", name: "outline", kind: "ellipse", lineType: "cut", rx: "width / 2", ry: "length / 2" },
    hole("hole", "0", "length / 2 - 3 * holeR"),
  ],
  rulers: cardRulers("-width / 2", "width / 2", "0", "length / 2"),
};

/**
 * Pacdora 271010: a band (bottle neck, jar or bundle label) `height` tall with a
 * round medallion of diameter `length` in the middle. Band and medallion meet
 * where the circle crosses the band's edges.
 */
const labelBand: DielineDocument = {
  ...emptyDocument(),
  variables: [
    { name: "R", expr: "length / 2", description: "Medallion radius" },
    { name: "b", expr: "min(height / 2, R * 0.8)", description: "Half the band, kept narrower than the medallion so the two still cross" },
    { name: "k", expr: "sqrt(R ^ 2 - b ^ 2)", description: "Half the medallion's opening on the band edge" },
  ],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "0", y: "-b" },
      segments: [
        to("width / 2 - k", "-b"),
        { type: "arc", x: "width / 2 + k", y: "-b", radius: "R" },
        to("width", "-b"),
        to("width", "b"),
        to("width / 2 + k", "b"),
        { type: "arc", x: "width / 2 - k", y: "b", radius: "R" },
        to("0", "b"),
      ],
    },
  ],
  rulers: [
    ruler("widthRuler", ["0", "-R"], ["width", "-R"]),
    ruler("lengthRuler", ["width / 2", "-R"], ["width / 2", "R"]),
    ruler("heightRuler", ["0", "-b"], ["0", "b"]),
  ],
};

/**
 * Pacdora 261140: a fold-over header for bags and blister cards. Two faces of
 * `length` close over the product; a pair of creases `height` apart on each side
 * wraps its top; the header between folds double on its middle crease, and a
 * keyhole slot cut in from the side on each half lands on the other, so the
 * folded header hangs on a peg. Both ends keep a small hole for a staple or tie.
 * As on the real die, the header between the slots is set in on the slots' side,
 * so it folds inside the faces, and each face rounds into its slot's outer edge;
 * the two halves round their corners into a point on the middle crease, on both sides.
 */
const hookY = (half: 1 | 2) => (half === 1 ? "length + height + head / 2" : "length + height + head * 1.5");
// Drawn downwards: the upper slot leaves the face above at x = 0 and returns to the
// set-in header; the lower one leaves the header and returns to the face below.
const slot = (half: 1 | 2): Segment[] => [
  half === 2 ? to("0", `${hookY(half)} + slotW / 2`, "rc") : to("inset", `${hookY(half)} + slotW / 2`),
  to("slotD - slotK", `${hookY(half)} + slotW / 2`),
  { type: "arc", x: "slotD - slotK", y: `${hookY(half)} - slotW / 2`, radius: "slotW", clockwise: true, large: true },
  half === 2 ? to("inset", `${hookY(half)} - slotW / 2`) : to("0", `${hookY(half)} - slotW / 2`, "rc"),
];
const MID = "length + height + head";
const hookTag: DielineDocument = {
  ...emptyDocument(),
  variables: [
    { name: "head", expr: "clamp(length * 0.45, 18, 40)", description: "Each half of the header" },
    { name: "total", expr: "2 * length + 2 * height + 2 * head" },
    { name: "slotW", expr: "clamp(head * 0.18, 3, 5)", description: "Hook slot width; its round end is twice as wide" },
    { name: "slotK", expr: "slotW * sqrt(3) / 2", description: "Where the slot meets its round end" },
    { name: "slotD", expr: "width * 0.4", description: "How far the slot reaches in, to its round end's centre" },
    { name: "rc", expr: "min(width, length) * 0.06", description: "Corner radius" },
    { name: "inset", expr: "min(width * 0.13, slotD - slotK - slotW)", description: "How far the header between the slots is set in" },
    { name: "mr", expr: "min(slotW, (head - slotW) / 2 - slotW / 2)", description: "Each header half's rounded corner at the middle crease, on both sides; the two meet in a point on the crease" },
    { name: "tieR", expr: "1.5" },
  ],
  nodes: [
    {
      id: "outline",
      name: "outline",
      kind: "path",
      lineType: "cut",
      closed: true,
      start: { x: "width / 2", y: "0" },
      segments: [
        to("width", "0", "rc"),
        to("width", `${MID} - mr`),
        { type: "arc", x: "width - mr", y: MID, radius: "mr", clockwise: false, large: false },
        { type: "arc", x: "width", y: `${MID} + mr`, radius: "mr", clockwise: false, large: false },
        to("width", "total", "rc"),
        to("0", "total", "rc"),
        ...slot(2),
        to("inset", `${MID} + mr`),
        { type: "arc", x: "inset + mr", y: MID, radius: "mr", clockwise: false, large: false },
        { type: "arc", x: "inset", y: `${MID} - mr`, radius: "mr", clockwise: false, large: false },
        ...slot(1),
        to("0", "0", "rc"),
        // Back to the start, so the last corner rounds too (the closing edge has no corner of its own).
        to("width / 2", "0"),
      ],
    },
    crease("wrap1", "length"),
    crease("wrap2", "length + height"),
    { id: "middle", name: "middle", kind: "line", lineType: "crease", from: { x: "inset + mr", y: MID }, to: { x: "width - mr", y: MID } },
    crease("wrap3", "length + height + 2 * head"),
    crease("wrap4", "total - length"),
    hole("tie1", "width / 2", "max(3 * tieR, rc)", "tieR"),
    hole("tie2", "width / 2", "total - max(3 * tieR, rc)", "tieR"),
  ],
  rulers: cardRulers("0", "width", "0", "length"),
};

/** Pacdora's folding greeting card: two leaves on one crease. */
const greetingCard: DielineDocument = {
  ...emptyDocument(),
  nodes: [
    { id: "outline", name: "outline", kind: "rect", lineType: "cut", width: "width", height: "2 * length" },
    crease("spine", "length"),
  ],
  rulers: cardRulers("0", "width", "0", "length"),
};

/** Cards ignore height unless they say otherwise; it is pinned so the field cannot mislead. */
const FLAT = 0;

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    slug: "bevel-hang-tag",
    title: "تگ آویز لبه‌پخ",
    description:
      "تگ آویز کلاسیک با دو گوشه‌ی پخ در بالا و سوراخ نخ در میان آن‌ها؛ رایج‌ترین برچسب قیمت و برند برای پوشاک، کیف، کفش و محصولات دست‌ساز.\nاندازه‌ی سوراخ با اندازه‌ی تگ تنظیم می‌شود و همیشه به اندازه‌ی یک پانچ استاندارد می‌ماند. برای این تگ مقوای گلاسه ۳۵۰ گرم یا کرافت مناسب است.",
    doc: bevelTag,
    size: { width: 50, length: 90, height: FLAT },
    min: { width: 30, length: 45, height: FLAT },
    max: { width: 120, length: 200, height: FLAT },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
  {
    slug: "heart-tag",
    title: "تگ قلبی",
    description:
      "تگ آویز قلبی برای هدیه، ولنتاین، شیرینی و بسته‌های مناسبتی. دو قوس بالایی و دو ضلع کناری بدون شکستگی به هم می‌رسند تا برش تمیز بماند.\nسوراخ نخ زیر فرورفتگی وسط قرار دارد و تگ صاف آویزان می‌شود.",
    doc: heartTag,
    size: { width: 60, length: 55, height: FLAT },
    min: { width: 30, length: 26, height: FLAT },
    max: { width: 150, length: 140, height: FLAT },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
  {
    slug: "flower-tag",
    title: "تگ گلی",
    description:
      "تگ پنج‌پر به شکل گل یا ابر، برای محصولات کودک، گل‌فروشی، هدیه و برندهای دست‌ساز. اندازه با عرض تگ تعیین می‌شود و گلبرگ‌ها همیشه هم‌اندازه می‌مانند.\nسوراخ نخ در گلبرگ بالایی است.",
    doc: flowerTag,
    size: { width: 70, length: 70, height: FLAT },
    min: { width: 35, length: 70, height: FLAT },
    max: { width: 160, length: 70, height: FLAT },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
  {
    slug: "round-tag",
    title: "تگ گرد و بیضی",
    description:
      "تگ و کارت گرد؛ با عرض و طول برابر دایره است و با اندازه‌های متفاوت بیضی می‌شود. برای برچسب درب شیشه، تگ هدیه، کارت تشکر و زیرلیوانی کاربرد دارد.\nسوراخ نخ نزدیک لبه‌ی بالا قرار دارد.",
    doc: roundTag,
    size: { width: 60, length: 60, height: FLAT },
    min: { width: 30, length: 30, height: FLAT },
    max: { width: 200, length: 200, height: FLAT },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
  {
    slug: "label-band",
    title: "نوار برچسب مدالی",
    description:
      "نوار برچسب با یک مدال گرد در وسط، برای دور گردن بطری، درب شیشه‌ی عسل و مربا، بسته‌های صابون و دسته‌کردن محصولات. طول نوار، قطر مدال و پهنای نوار جدا تنظیم می‌شوند.\nدو سر نوار پشت محصول روی هم چسب می‌خورند.",
    doc: labelBand,
    size: { width: 200, length: 50, height: 25 },
    min: { width: 80, length: 25, height: 10 },
    max: { width: 500, length: 120, height: 80 },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
  {
    slug: "header-hang-tag",
    title: "هدر آویز تاشو",
    description:
      "هدر کارتی برای بستن سر کیسه‌های زیپی، جوراب، لوازم جانبی و قطعات کوچک فروشگاهی. دو رو روی دهانه‌ی کیسه بسته می‌شوند، دو جفت خط تا به فاصله‌ی ضخامت بسته دور آن می‌پیچند و سرِ دولا با شکاف قلاب روی میله‌ی ویترین آویزان می‌شود.\nدو سوراخ کوچک دو سر برای منگنه یا بست است.",
    doc: hookTag,
    size: { width: 60, length: 60, height: 10 },
    min: { width: 40, length: 30, height: 3 },
    max: { width: 150, length: 150, height: 30 },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
  {
    slug: "greeting-card",
    title: "کارت تبریک تاشو",
    description:
      "کارت دولت با یک خط تا در وسط، برای کارت تبریک، دعوت، منو و کارت تشکر داخل بسته. اندازه‌ها اندازه‌ی کارتِ تاخورده است.\nروی مقوای گلاسه یا تحریر ضخیم چاپ می‌شود.",
    doc: greetingCard,
    size: { width: 105, length: 148, height: FLAT },
    min: { width: 50, length: 50, height: FLAT },
    max: { width: 250, length: 300, height: FLAT },
    materials: CARD_MATERIALS,
    bleed: 3,
  },
];
