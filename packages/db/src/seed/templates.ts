import { checkDieline } from "../../../dieline-engine/src/checks/checks";
import { render } from "../../../dieline-engine/src/eval/render";
import { toFoldSVG } from "../../../dieline-engine/src/export/fold";
import { GABLE_GUSSET_LEAN } from "../../../dieline-engine/src/library/components";
import { presetBody } from "../../../dieline-engine/src/library/presets";
import { parseDocument } from "../../../dieline-engine/src/spec/schema";
import { emptyDocument, type DielineDocument, type Node, type PanelsNode, type Ruler } from "../../../dieline-engine/src/spec/types";
import { extractSegmentsFromSvg } from "../../../dieline-3d/src/extract";
import { buildFoldRig } from "../../../dieline-3d/src/foldRig";
import { prisma } from "../lib/prisma";

/**
 * The starter templates, written to the database by slug, so running this again
 * updates them. A template that fails validation, or any design check within its
 * size range, stops the run: only clean templates are saved.
 *
 *     pnpm --filter @repo/db seed:templates
 */

type Size = { width: number; length: number; height: number };

type Template = {
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

const THICKNESS: Record<string, number> = { glossyCardboard: 0.5, artPaper: 0.2, fFlute: 1, eFlute: 2, bFlute: 3 };

const ruler = (name: string, from: [string, string], to: [string, string]): Ruler => ({
  id: name,
  name,
  from: { x: from[0], y: from[1] },
  to: { x: to[0], y: to[1] },
  offset: "0",
});

/** Width, depth and height on a front, side, back, side body. */
const boxRulers = (): Ruler[] => [
  ruler("widthRuler", ["@body.front.bottomLeft.x", "height * 0.25"], ["@body.front.bottomRight.x", "height * 0.25"]),
  ruler("depthRuler", ["@body.front.right.x", "@body.front.right.y"], ["@body.side1.right.x", "@body.side1.right.y"]),
  ruler("heightRuler", ["@body.side2.bottom.x", "@body.side2.bottom.y"], ["@body.side2.top.x", "@body.side2.top.y"]),
];

/** The glue flap on the first panel's outer edge, as the samples have it. */
const glueLeft = (body: PanelsNode): PanelsNode => {
  const { right, ...rest } = body;
  return { ...rest, left: right };
};

const box = (preset: Parameters<typeof presetBody>[0], extra: Partial<DielineDocument> = {}, nodes: Node[] = []): DielineDocument => ({
  ...emptyDocument(),
  nodes: [glueLeft(presetBody(preset, "body")), ...nodes],
  rulers: boxRulers(),
  ...extra,
});

/** A window with one scooped corner and one chamfered, set in from the panel's edges. */
const shapedWindow: Node = {
  id: "window",
  name: "window",
  kind: "path",
  lineType: "cut",
  closed: true,
  // Starts at the scoop, so the arc sits between two lines and the closing edge is
  // a straight one: an arc's computed end can miss a closing point by a rounding error.
  start: { x: "@body.back.bottomLeft.x + winX + winScoop", y: "height - winY" },
  segments: [
    { type: "arc", x: "@body.back.bottomLeft.x + winX", y: "height - winY - winScoop", radius: "winScoop", clockwise: true },
    { type: "to", x: "@body.back.bottomLeft.x + winX", y: "winY" },
    { type: "to", x: "@body.back.bottomRight.x - winX - winCut", y: "winY" },
    { type: "to", x: "@body.back.bottomRight.x - winX", y: "winY + winCut" },
    { type: "to", x: "@body.back.bottomRight.x - winX", y: "height - winY" },
  ],
};

/**
 * The tray is drawn directly rather than built from parts: its double walls and
 * webbed corners are one continuous sheet, and nothing else shares them. Measured
 * from a real sample. Origin at the base's bottom left, with the tray's own names:
 * `L` and `W` the base, `h` the wall, `l` the lip, `st` the step on the inner wall.
 */
const TRAY_VARIABLES = [
  { name: "L", expr: "max(length, width)" },
  { name: "W", expr: "min(length, width)" },
  { name: "h", expr: "height" },
  { name: "l", expr: "clamp(height * 0.3, 8, 18)", description: "Lip of the inner wall" },
  { name: "st", expr: "max(1, thickness * 2)", description: "Inner wall step: clears the wall it folds over" },
  { name: "ld", expr: "l * 1.05", description: "Long lip's end, along the wall" },
  { name: "lr", expr: "l * 0.4", description: "Long lip's end, across the wall" },
];

/** A quarter of the outline, from the long lip round to the short lip: offsets from the base's top right corner. */
const TRAY_QUARTER: [string, string][] = [
  ["-st - ld", "2 * h + l"],
  ["-st - ld", "2 * h + lr"],
  ["-st", "2 * h"],
  ["-st", "1.46 * h"],
  ["0", "1.46 * h"],
  ["0", "h"],
  ["0.66 * h", "0.89 * h"],
  ["0.66 * h", "0.66 * h"],
  ["0.91 * h", "0.66 * h"],
  ["h", "0"],
  ["1.52 * h", "0"],
  ["1.52 * h", "-st"],
  ["2 * h", "-st"],
  ["2 * h + l", "-st - lr"],
];

const trayNodes = (): Node[] => {
  const corner = (mirrorX: boolean, mirrorY: boolean) => ([dx, e]: [string, string]): [string, string] => [
    mirrorX ? `-(${dx})` : `L + (${dx})`,
    mirrorY ? `-(${e})` : `W + (${e})`,
  ];
  const q = TRAY_QUARTER;
  const outline = [
    ...q.map(corner(false, false)),
    ...[...q].reverse().map(corner(false, true)),
    ...q.map(corner(true, true)),
    ...[...q].reverse().map(corner(true, false)),
  ];
  const [start, ...rest] = outline;

  const line = (name: string, lineType: "cut" | "crease" | "reverseCrease", a: [string, string], b: [string, string]): Node => ({
    id: name,
    name,
    kind: "line",
    lineType,
    from: { x: a[0], y: a[1] },
    to: { x: b[0], y: b[1] },
  });

  // Everything that exists once per corner.
  const corners = ([["TR", false, false], ["BR", false, true], ["BL", true, true], ["TL", true, false]] as const).flatMap(([id, mx, my]) => {
    const at = corner(mx, my);
    return [
      // The web: cut from the base's corner, then creased to the outline.
      line(`cut${id}`, "cut", at(["0", "0"]), at(["0.35 * h", "0.35 * h"])),
      line(`web${id}`, "crease", at(["0.35 * h", "0.35 * h"]), at(["0.66 * h", "0.66 * h"])),
      // Where the web joins the long wall.
      line(`wall${id}`, "crease", at(["0", "0"]), at(["0", "h"])),
    ];
  });

  return [
    { id: "outline", name: "outline", kind: "path", lineType: "cut", closed: true, start: { x: start![0], y: start![1] }, segments: rest.map(([x, y]) => ({ type: "to" as const, x, y })) },
    // Base.
    line("baseTop", "crease", ["0", "W"], ["L", "W"]),
    line("baseBottom", "crease", ["0", "0"], ["L", "0"]),
    line("baseLeft", "crease", ["0", "0"], ["0", "W"]),
    line("baseRight", "crease", ["L", "0"], ["L", "W"]),
    // Long walls fold over at the top; their lips fold the other way in the middle.
    line("rimTop", "crease", ["0", "W + h"], ["L", "W + h"]),
    line("rimBottom", "crease", ["0", "-h"], ["L", "-h"]),
    line("lipTop", "reverseCrease", ["st", "W + 2 * h"], ["L - st", "W + 2 * h"]),
    line("lipBottom", "reverseCrease", ["st", "-2 * h"], ["L - st", "-2 * h"]),
    // Short walls, with their webs along the top and bottom.
    line("webRightTop", "crease", ["L", "W"], ["L + h", "W"]),
    line("webRightBottom", "crease", ["L", "0"], ["L + h", "0"]),
    line("webLeftTop", "crease", ["0", "W"], ["-h", "W"]),
    line("webLeftBottom", "crease", ["0", "0"], ["-h", "0"]),
    line("rimRight", "crease", ["L + h", "0"], ["L + h", "W"]),
    line("rimLeft", "crease", ["-h", "0"], ["-h", "W"]),
    line("lipRight", "reverseCrease", ["L + 2 * h", "st"], ["L + 2 * h", "W - st"]),
    line("lipLeft", "reverseCrease", ["-2 * h", "st"], ["-2 * h", "W - st"]),
    ...corners,
  ];
};

/** The band that slides over the tray: side, top, side, bottom and a glue flap. */
const traySleeve: Node = {
  ...presetBody("sleeve", "sleeve"),
  height: "max(length, width) + 3",
  panels: [
    { id: "s1", name: "side1", width: "height + 2 * sleeveGap" },
    { id: "s2", name: "top", width: "min(length, width) + 2 * sleeveGap" },
    { id: "s3", name: "side2", width: "height + 2 * sleeveGap" },
    { id: "s4", name: "under", width: "min(length, width) + 2 * sleeveGap" },
  ],
  // Lies beside the tray, turned a quarter, centred on it.
  transform: {
    x: "L + 2 * h + l + 25 + L + 3",
    y: "min(length, width) / 2 - height - min(length, width) - 2 * sleeveGap - 8",
    rotate: "90",
  },
};

const TEMPLATES: Template[] = [
  {
    slug: "reverse-tuck-end",
    title: "جعبه درب‌دار معکوس",
    description:
      "جعبه درب‌دار معکوس رایج‌ترین جعبه تاشو برای محصولات سبک است: یک درب در بالا و یک درب در پایین، روی دو پنل روبه‌رو.\nچون درب‌ها در دو جهت باز می‌شوند، مقوا در چیدمان روی فرم چاپ کمتر هدر می‌رود و تولید آن اقتصادی است. لوازم آرایشی، دارو، مکمل و محصولات کوچک مصرفی معمولاً در این جعبه بسته‌بندی می‌شوند.\nزبانه‌ی درب‌ها با قفل اصطکاکی بسته می‌ماند و جعبه با یک خط چسب کناری به شکل نهایی می‌رسد.",
    doc: box("reverseTuckEnd"),
    size: { width: 120, length: 60, height: 160 },
    min: { width: 40, length: 30, height: 40 },
    max: { width: 300, length: 200, height: 400 },
    materials: ["glossyCardboard", "artPaper", "fFlute"],
    bleed: 5,
  },
  {
    slug: "gable-handle-box",
    title: "جعبه دسته‌دار شیروانی",
    description:
      "جعبه دسته‌دار شیروانی برای حمل راحت محصول طراحی شده است: دو سقف در میانه‌ی جعبه به هم می‌رسند و لبه‌های بالایی آن‌ها با هم یک دسته‌ی دولایه می‌سازند.\nکف جعبه قفل چهارتکه است و بدون چسب بسته می‌شود؛ بنابراین جعبه به‌صورت تخت انبار می‌شود و هنگام مصرف به‌سرعت شکل می‌گیرد. این مدل برای شیرینی، غذای بیرون‌بر، هدیه و بسته‌های تبلیغاتی مناسب است.",
    doc: box("gableHandle"),
    size: { width: 300, length: 150, height: 180 },
    min: { width: 100, length: 60, height: 60 },
    max: { width: 500, length: 300, height: 400 },
    materials: ["glossyCardboard", "fFlute", "eFlute"],
    bleed: 5,
  },
  {
    slug: "tray-with-sleeve",
    title: "سینی با روکش کشویی",
    description:
      "این بسته‌بندی دوتکه از یک سینی چهارجداره و یک روکش تشکیل شده است که روی سینی می‌لغزد؛ مشتری با کشیدن سینی، محصول را مثل باز کردن یک کشو می‌بیند.\nلبه‌ی دیواره‌های سینی به داخل تا می‌شود و دیواره را محکم نگه می‌دارد. روکش با یک خط چسب بسته می‌شود و فضای مناسبی برای چاپ طرح اصلی دارد. این مدل برای شکلات، هدیه، پوشاک کوچک و محصولات لوکس کاربرد دارد.",
    doc: {
      ...emptyDocument(),
      variables: [
        { name: "sleeveGap", expr: "max(0.5, thickness)", description: "Clearance so the sleeve slides over the tray" },
        ...TRAY_VARIABLES,
      ],
      nodes: [...trayNodes(), traySleeve],
      rulers: [
        ruler("widthRuler", ["0", "W * 0.25"], ["L", "W * 0.25"]),
        ruler("depthRuler", ["L * 0.75", "0"], ["L * 0.75", "W"]),
        ruler("heightRuler", ["L * 0.25", "W"], ["L * 0.25", "W + h"]),
      ],
    },
    size: { width: 200, length: 100, height: 50 },
    min: { width: 60, length: 50, height: 20 },
    max: { width: 400, length: 300, height: 150 },
    materials: ["glossyCardboard", "fFlute", "eFlute"],
    bleed: 3,
  },
  {
    slug: "keyboard-box",
    title: "جعبه کیبوردی",
    description:
      "جعبه کیبوردی از پرفروش‌ترین جعبه‌های ارسال در ایران است: بدون چسب و منگنه بسته می‌شود و زبانه‌های کوچک دیواره‌ها داخل شیارهای کف قفل می‌شوند.\nدیواره‌های کناری دولایه هستند و جعبه را محکم نگه می‌دارند؛ درب یکپارچه با لبه‌های گرد روی جعبه بسته می‌شود. با بزرگ‌تر شدن جعبه، تعداد زبانه‌ها و شیارها هم بیشتر می‌شود تا قفل در تمام طول دیواره محکم بماند.\nاین مدل برای ارسال پستی، فروشگاه‌های اینترنتی، پوشاک، کفش، کتاب و بسته‌های هدیه مناسب است و معمولاً با کارتن فلوت E یا B تولید می‌شود.",
    doc: {
      ...emptyDocument(),
      nodes: [presetBody("keyboardBox", "body")],
      rulers: [
        ruler("widthRuler", ["@body.base.bottomLeft.x", "min(length, width) * 0.1"], ["@body.base.bottomRight.x", "min(length, width) * 0.1"]),
        ruler("depthRuler", ["@body.base.bottom.x", "@body.base.bottom.y"], ["@body.base.top.x", "@body.base.top.y"]),
        ruler("heightRuler", ["@body.wall2.left.x", "min(length, width) * 0.5"], ["@body.wall2.right.x", "min(length, width) * 0.5"]),
      ],
    },
    size: { width: 315, length: 202, height: 62 },
    min: { width: 120, length: 80, height: 30 },
    max: { width: 600, length: 600, height: 200 },
    materials: ["eFlute", "bFlute", "fFlute"],
    bleed: 5,
  },
  {
    slug: "auto-lock-box",
    title: "جعبه کف‌اتوماتیک",
    description:
      "کف این جعبه از قبل چسب خورده و با باز کردن جعبه‌ی تخت، خودش سر جایش قرار می‌گیرد؛ به همین دلیل بسته‌بندی در خط تولید بسیار سریع انجام می‌شود.\nدرب بالا با زبانه بسته می‌شود و کف قفل‌شده وزن بیشتری نسبت به جعبه‌های درب‌دار ساده تحمل می‌کند. این مدل برای شیشه، محصولات سنگین‌تر و تولید با تیراژ بالا انتخاب مناسبی است.",
    doc: box("autoLockBottom"),
    size: { width: 120, length: 60, height: 160 },
    min: { width: 60, length: 40, height: 50 },
    max: { width: 300, length: 200, height: 400 },
    materials: ["glossyCardboard", "fFlute"],
    bleed: 5,
  },
  {
    slug: "fefco-0201",
    title: "کارتن استاندارد فکو ۰۲۰۱",
    description:
      "کارتن فکو ۰۲۰۱ رایج‌ترین کارتن حمل و انبار در دنیاست: چهار دیواره، یک لبه‌ی اتصال کناری و چهار لبه در بالا و چهار لبه در پایین که هر کدام به اندازه‌ی نصف عرض کارتن هستند.\nلبه‌های بلند در وسط کارتن به هم می‌رسند و با چسب نواری بسته می‌شوند. چون همه‌ی برش‌ها خط صاف هستند، این کارتن کم‌هزینه‌ترین بسته‌بندی کارتنی است و برای ارسال، جابه‌جایی، انبارداری و بسته‌بندی ثانویه به کار می‌رود.\nاین کارتن معمولاً با کارتن سه‌لایه‌ی فلوت B یا E تولید می‌شود.",
    doc: box("fefco0201", {
      // As on the sample die: the height ruler stands on the back panel, centred
      // on the body, and reads the typed height (the creases are a board either side).
      rulers: [
        ruler("widthRuler", ["@body.front.bottomLeft.x", "@body.bodyHeight * 0.25"], ["@body.front.bottomRight.x", "@body.bodyHeight * 0.25"]),
        ruler("depthRuler", ["@body.side1.bottomLeft.x", "@body.bodyHeight * 0.75"], ["@body.side1.bottomRight.x", "@body.bodyHeight * 0.75"]),
        ruler("heightRuler", ["@body.back.bottom.x", "(@body.bodyHeight - height) / 2"], ["@body.back.bottom.x", "(@body.bodyHeight + height) / 2"]),
      ],
    }),
    size: { width: 400, length: 300, height: 300 },
    min: { width: 100, length: 80, height: 60 },
    max: { width: 800, length: 600, height: 800 },
    materials: ["bFlute", "eFlute"],
    bleed: 3,
  },
  {
    slug: "straight-tuck-window",
    title: "جعبه درب‌دار پنجره‌دار",
    description:
      "در این جعبه هر دو درب روی یک پنل قرار دارند و وقتی جعبه باز می‌شود، لبه‌ی برش از جلوی جعبه دیده نمی‌شود. پنجره‌ی بزرگ پنل پشتی با یک گوشه‌ی گرد و یک گوشه‌ی پخ، محصول را به مشتری نشان می‌دهد.\nاین طراحی برای اسباب‌بازی، لوازم جانبی، لوازم آرایشی و هر محصولی که دیده شدنش به فروش کمک می‌کند مناسب است. پشت پنجره می‌توان یک طلق شفاف چسباند.",
    doc: box(
      "straightTuckEnd",
      {
        variables: [
          { name: "winX", expr: "max(length, width) * 0.125", description: "Window inset from the panel's sides" },
          { name: "winY", expr: "height * 0.11", description: "Window inset from the top and bottom" },
          { name: "winSize", expr: "min(max(length, width) * 0.75, height * 0.78)" },
          { name: "winScoop", expr: "winSize * 0.31", description: "Scooped corner radius" },
          { name: "winCut", expr: "winSize * 0.2", description: "Chamfered corner size" },
        ],
      },
      [shapedWindow],
    ),
    size: { width: 120, length: 60, height: 180 },
    min: { width: 60, length: 30, height: 80 },
    max: { width: 300, length: 200, height: 400 },
    materials: ["glossyCardboard", "fFlute"],
    bleed: 5,
  },
];

/** Every corner of the size range, and the sample size, on each material. */
function validate(template: Template) {
  const parsed = parseDocument(JSON.parse(JSON.stringify(template.doc)));
  if (!parsed.ok) throw new Error(`${template.slug}: invalid document: ${JSON.stringify(parsed).slice(0, 400)}`);

  const pick = <K extends keyof Size>(k: K) => [template.min[k], template.size[k], template.max[k]];
  const problems = new Map<string, number>();
  let runs = 0;
  for (const width of pick("width"))
    for (const length of pick("length"))
      for (const height of pick("height"))
        for (const material of template.materials) {
          const result = render(parsed.document, { width, length, height, thickness: THICKNESS[material]!, bleed: 0 } as never);
          runs++;
          const found = [...result.diagnostics.map((d) => `diagnostic: ${d.message}`), ...checkDieline(result).map((i) => i.code)];
          for (const f of found) {
            const key = `${f} (e.g. ${width}x${length}x${height} ${material})`;
            problems.set(key.replace(/ \(e\.g\..*/, ""), (problems.get(key.replace(/ \(e\.g\..*/, "")) ?? 0) + 1);
            if (!problems.has(`first:${f}`)) problems.set(`first:${f} ${width}x${length}x${height} ${material}`, 1);
          }
        }
  return { document: parsed.document, runs, problems };
}

/** The folds a template cannot infer: which way, and how far, past a plain 90°. */
function withFolds(template: Template, doc: DielineDocument): DielineDocument {
  const { width, length, height } = template.size;
  const result = render(doc, { width, length, height, thickness: 2, bleed: 0 } as never);
  const rig = buildFoldRig(extractSegmentsFromSvg(toFoldSVG(result)));
  const faces = rig.nodes.map((node, faceIndex) => ({ node, faceIndex })).filter(({ node }) => !node.isHole);
  const override = ({ node, faceIndex }: (typeof faces)[number], direction: "in" | "out", angle: number) => ({
    faceIndex,
    direction,
    angle,
    vertexCount: node.face.outline.length,
  });

  if (template.slug === "gable-handle-box") {
    // The roofs fold flat and meet in the middle, the handle flaps fold back up
    // to stand back to back, and the gussets lean in over the roofs until their
    // slits catch the handles' ears; the grip flap stays in its handle. Faces are told apart by where they hang
    // in the fold tree: everything above the body's top (SVG y grows downwards,
    // the root is a body panel) is the top; a roof hangs off a body panel and
    // carries a handle, a gusset hangs off a body panel and carries nothing.
    const root = rig.nodes.find((n) => n.parent === null && !n.isHole)!;
    const top = faces.filter(({ node }) => node.face.centroid[1] < root.face.centroid[1] - height / 2);
    const inTop = new Set(top.map((f) => f.faceIndex));
    const onBody = top.filter((f) => f.node.parent !== null && !inTop.has(f.node.parent));
    const roofs = onBody.filter((f) => top.some((c) => c.node.parent === f.faceIndex));
    const gussets = onBody.filter((f) => !roofs.includes(f));
    const handles = top.filter((f) => roofs.some((r) => r.faceIndex === f.node.parent));
    const grips = top.filter((f) => handles.some((h) => h.faceIndex === f.node.parent));
    // The rig may read the grip flap as part of the slot's opening; then there is no grip face.
    if (roofs.length !== 2 || handles.length !== 2 || gussets.length !== 2) {
      throw new Error(`gable-handle-box: unexpected fold tree (${roofs.length} roofs, ${handles.length} handles, ${gussets.length} gussets)`);
    }
    return {
      ...doc,
      folds: {
        faceCount: rig.stats.faceCount,
        overrides: [
          ...roofs.map((f) => override(f, "in", 90)),
          ...handles.map((f) => override(f, "out", 90)),
          ...gussets.map((f) => override(f, "in", GABLE_GUSSET_LEAN)),
          ...grips.map((f) => override(f, "in", 0)),
        ],
      },
    };
  }

  if (template.slug === "keyboard-box") {
    // The lid is the largest panel, but the box stands on its base.
    const L = Math.max(width, length);
    const W = Math.min(width, length);
    const baseX = 2 * height - 1.5 + 5 + L / 2; // Inner wall, top and wall come first (2 mm E flute: 5 mm top).
    const off = ({ node }: (typeof faces)[number]) => Math.hypot(node.face.centroid[0] - baseX, node.face.centroid[1] + W / 2);
    const base = [...faces].sort((a, b) => off(a) - off(b))[0]!;
    return { ...doc, folds: { faceCount: rig.stats.faceCount, rootFace: base.faceIndex, overrides: [] } };
  }

  if (template.slug === "tray-with-sleeve") {
    // Double walls: the inner wall folds right over the rim, and its lip turns to lie on the base.
    const L = Math.max(width, length);
    const W = Math.min(width, length);
    const beyond = ({ node }: (typeof faces)[number], by: number) => {
      const [x, svgY] = node.face.centroid;
      const y = -svgY;
      if (x > L + 2 * height + 40) return false; // The sleeve.
      return x > L + by || x < -by || y > W + by || y < -by;
    };
    const lips = faces.filter((f) => beyond(f, 2 * height));
    const inner = faces.filter((f) => beyond(f, height) && !lips.includes(f));
    return {
      ...doc,
      folds: { faceCount: rig.stats.faceCount, overrides: [...inner.map((f) => override(f, "in", 180)), ...lips.map((f) => override(f, "out", 90))] },
    };
  }

  return doc;
}

async function main() {
  const dryRun = process.argv.includes("--check");
  let failed = false;

  // `--only=slug,slug` seeds just those, so templates edited in the Studio are left alone.
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

  for (const template of TEMPLATES.filter((t) => !only || only.includes(t.slug))) {
    const { document, runs, problems } = validate(template);
    console.log(`${template.slug}: ${runs} renders, ${problems.size ? "PROBLEMS" : "clean"}`);
    for (const [key, count] of problems) console.log(`   ${key}: ${count}`);
    if (problems.size) failed = true;
    if (dryRun || problems.size) continue;

    const doc = withFolds(template, document);
    const material = template.materials[0]!;
    const data = {
      title: template.title,
      description: template.description,
      specification: JSON.stringify(doc),
      materials: template.materials.join(","),
      defaultMaterial: material,
      dimensionTypes: "manufacture,inner,outer",
      minWidth: template.min.width,
      minLength: template.min.length,
      minHeight: template.min.height,
      maxWidth: template.max.width,
      maxLength: template.max.length,
      maxHeight: template.max.height,
      active: true,
    };
    const settings = {
      bleed: template.bleed,
      thickness: THICKNESS[material]!,
      material,
      dimensionType: "manufacture" as const,
      ...template.size,
    };
    const existing = await prisma.dieline.findUnique({ where: { slug: template.slug } });
    if (existing) {
      await prisma.dieline.update({ where: { id: existing.id }, data: { ...data, settings: { update: settings } } });
    } else {
      await prisma.dieline.create({ data: { ...data, slug: template.slug, variable: "[]", settings: { create: settings } } });
    }
    console.log(`   saved /dieline/${template.slug}`);
  }

  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
