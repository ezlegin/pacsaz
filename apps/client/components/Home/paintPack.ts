import type { BoxSize } from "@/lib/dieline/homeBox";
import type { PrintFrame } from "@repo/dieline-3d/stage";
import { fa } from "./format";
import { LOGO_FULL, LOGO_ICON } from "./logoPaths";

const FONT = "KalamehWebFaNum, KalamehWeb, sans-serif";

const INK = "#1e1238";
const MUTED = "#6b6286";
const VIOLET = "#8158ff";
const PAPER = "#fdfcff";

type Box = PrintFrame["panels"][number];
type Ctx = CanvasRenderingContext2D;

/** Draws a logo from its path data, `width` wide, centred on (cx, cy). */
const drawLogo = (context: Ctx, logo: typeof LOGO_FULL, cx: number, cy: number, width: number, color: string) => {
  const scale = width / logo.width;
  context.save();
  context.translate(cx - width / 2, cy - (logo.height * scale) / 2);
  context.scale(scale, scale);
  context.fillStyle = color;
  for (const d of logo.paths) context.fill(new Path2D(d));
  context.restore();
};

/** Right-aligned Persian copy, wrapped to `width`; returns where the next line would go. */
const paragraph = (context: Ctx, text: string, right: number, top: number, width: number, size: number, color: string, weight = 500) => {
  context.font = `${weight} ${size}px ${FONT}`;
  context.fillStyle = color;
  context.direction = "rtl";
  context.textAlign = "right";
  context.textBaseline = "top";
  let line = "";
  let y = top;
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > width && line) {
      context.fillText(line, right, y);
      line = word;
      y += size * 1.75;
    } else line = next;
  }
  if (line) context.fillText(line, right, y);
  return y + size * 1.75;
};

const centred = (context: Ctx, text: string, x: number, y: number, size: number, color: string, weight = 500, direction: CanvasDirection = "rtl") => {
  context.font = `${weight} ${size}px ${FONT}`;
  context.fillStyle = color;
  context.direction = direction;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x, y);
};

/** A plausible EAN-style barcode: fixed bars, so the print never changes between frames. */
const barcode = (context: Ctx, x: number, y: number, width: number, height: number) => {
  const pattern = "1011001011101101001110100101101110010110100111011010010111011001011101";
  const bar = width / pattern.length;
  context.fillStyle = "#ffffff";
  context.fillRect(x - bar * 4, y - bar * 4, width + bar * 8, height + bar * 4 + height * 0.32);
  context.fillStyle = INK;
  [...pattern].forEach((bit, index) => {
    if (bit === "1") context.fillRect(x + index * bar, y, bar * 0.92, index < 3 || index > pattern.length - 4 ? height * 1.08 : height);
  });
  centred(context, "6 260123 456789", x + width / 2, y + height * 1.22, height * 0.2, INK, 500, "ltr");
};

/** The recycling loop: three chasing arrows in one stroke. */
const recycle = (context: Ctx, cx: number, cy: number, r: number, color: string) => {
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = r * 0.16;
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
    context.beginPath();
    context.arc(cx, cy, r, a + 0.25, a + 1.75);
    context.stroke();
    const tip = a + 1.95;
    const tx = cx + Math.cos(tip) * r;
    const ty = cy + Math.sin(tip) * r;
    context.beginPath();
    context.moveTo(tx + Math.cos(tip + Math.PI / 2) * r * 0.05, ty + Math.sin(tip + Math.PI / 2) * r * 0.05);
    context.lineTo(tx + Math.cos(tip) * r * 0.32, ty + Math.sin(tip) * r * 0.32);
    context.lineTo(tx - Math.cos(tip) * r * 0.32, ty - Math.sin(tip) * r * 0.32);
    context.closePath();
    context.fill();
  }
  context.restore();
};

/** A faint field of tiny box outlines, the brand's own subject, behind everything. */
const pattern = (context: Ctx, width: number, height: number, unit: number) => {
  const step = unit * 0.16;
  const s = step * 0.22;
  context.save();
  context.strokeStyle = "rgb(129 88 255 / 0.2)";
  context.lineWidth = Math.max(1, s * 0.12);
  for (let row = 0, y = step / 2; y < height; row++, y += step) {
    for (let x = (row % 2) * (step / 2); x < width; x += step) {
      context.strokeRect(x - s / 2, y - s / 2, s, s);
    }
  }
  context.restore();
};

const front = (context: Ctx, panel: Box, size: BoxSize, band: number) => {
  const cx = panel.x + panel.width / 2;
  // Small on purpose: a real pack sets its copy small and lets the board breathe.
  const unit = Math.min(panel.width, panel.height * 0.62) * 0.72;
  const pad = panel.width * 0.1;

  // A clean card for the brand, so the pattern never runs under the logo.
  context.fillStyle = PAPER;
  context.fillRect(panel.x + pad * 0.5, panel.y + panel.height * 0.06, panel.width - pad, band - panel.y - panel.height * 0.1);

  centred(context, "WELCOME PACK", cx, panel.y + panel.height * 0.12, unit * 0.045, VIOLET, 700, "ltr");
  drawLogo(context, LOGO_FULL, cx, panel.y + panel.height * 0.26, panel.width * 0.48, VIOLET);

  centred(context, "به خانواده‌ی پک‌ساز خوش آمدی", cx, panel.y + panel.height * 0.42, unit * 0.075, INK, 800);
  centred(context, "دایلاین دقیق، بسته‌بندی بی‌نقص", cx, panel.y + panel.height * 0.48, unit * 0.05, MUTED, 500);

  // Three promises, as a printed pack would list its contents.
  const items = ["قالب پارامتریک", "کنترل فنی", "خروجی چاپ"];
  const rowY = panel.y + panel.height * 0.58;
  const slot = (panel.width - pad * 2) / items.length;
  items.forEach((item, index) => {
    const x = panel.x + panel.width - pad - slot * (index + 0.5);
    context.strokeStyle = VIOLET;
    context.lineWidth = Math.max(1.5, unit * 0.008);
    context.beginPath();
    context.arc(x, rowY, unit * 0.045, 0, Math.PI * 2);
    context.stroke();
    centred(context, fa(index + 1), x, rowY, unit * 0.045, VIOLET, 800);
    centred(context, item, x, rowY + unit * 0.09, unit * 0.038, INK, 600);
  });

  // In the band: the address and the size this pack was cut to.
  const bandMid = band + (panel.y + panel.height - band) / 2;
  centred(context, "pacsaz.ir", cx, bandMid - unit * 0.035, unit * 0.075, "#ffffff", 800, "ltr");
  centred(context, `${fa(size.width)} × ${fa(size.length)} × ${fa(size.height)} mm`, cx, bandMid + unit * 0.05, unit * 0.035, "rgb(255 255 255 / 0.75)", 500, "ltr");
};

const back = (context: Ctx, panel: Box, band: number) => {
  const pad = panel.width * 0.12;
  const right = panel.x + panel.width - pad;
  const width = panel.width - pad * 2;
  const unit = Math.min(panel.width, panel.height * 0.62) * 0.75;

  context.fillStyle = PAPER;
  context.fillRect(panel.x + pad * 0.5, panel.y + panel.height * 0.06, panel.width - pad, band - panel.y - panel.height * 0.1);

  drawLogo(context, LOGO_ICON, right - unit * 0.07, panel.y + panel.height * 0.13, unit * 0.14, VIOLET);
  let y = paragraph(context, "سلام، خوش آمدی!", right, panel.y + panel.height * 0.2, width, unit * 0.07, INK, 800);
  y = paragraph(
    context,
    "این جعبه با پک‌ساز طراحی شده است؛ از انتخاب قالب تا فایل آماده‌ی قالب‌سازی، در چند دقیقه. اندازه را بده، جنس مقوا را انتخاب کن و فایل DXF، PDF یا SVG بگیر.",
    right,
    y + unit * 0.01,
    width,
    unit * 0.04,
    MUTED,
  );
  y = paragraph(context, "پشتیبانی: support@pacsaz.ir", right, y + unit * 0.03, width, unit * 0.036, INK, 600);

  const codeWidth = width * 0.5;
  barcode(context, panel.x + pad, band - panel.height * 0.16, codeWidth, panel.height * 0.08);
  recycle(context, right - unit * 0.05, band - panel.height * 0.11, unit * 0.045, MUTED);

  const bandMid = band + (panel.y + panel.height - band) / 2;
  centred(context, "طراحی و ساخت در ایران · pacsaz.ir", panel.x + panel.width / 2, bandMid, unit * 0.04, "#ffffff", 600);
};

/**
 * The design on the showcase box. Glossy board gets a real Pacsaz welcome pack:
 * white board with a faint field of tiny boxes, a deep violet band wrapping
 * the foot of the body, the logo and greeting on the front, a letter, barcode
 * and recycling mark on the back. Violet is the brand's accent, not a flood.
 * Flute is left bare kraft with dark ink, as corrugated usually is.
 *
 * `panels` are the two widest body panels, front first on the sheet.
 */
export const paintPack = (size: BoxSize, kraft: boolean) => (context: Ctx, frame: PrintFrame) => {
  const { width, height, panels } = frame;
  // The closed box is seen from the panel nearer the sheet's left.
  const [first, second] = [...panels].sort((a, b) => a.x - b.x);
  const body = first ?? second;

  if (kraft) {
    context.fillStyle = "#c8a273";
    context.fillRect(0, 0, width, height);
    for (const panel of panels) {
      const cx = panel.x + panel.width / 2;
      drawLogo(context, LOGO_FULL, cx, panel.y + panel.height * 0.4, panel.width * 0.45, "#3b2a1a");
      centred(context, "pacsaz.ir", cx, panel.y + panel.height * 0.88, Math.min(panel.width, panel.height) * 0.06, "#3b2a1a", 700, "ltr");
    }
    return;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  if (!body) return;
  pattern(context, width, height, Math.min(body.width, body.height));

  // The band runs the whole sheet from one height down, so it wraps the closed box.
  const band = body.y + body.height * 0.78;
  // The site's primary button, printed: violet falling to deep violet down to the
  // body's foot, with the same thin highlight along its top edge.
  const foot = body.y + body.height;
  const wash = context.createLinearGradient(0, band, 0, foot);
  wash.addColorStop(0, "#8b5cf6");
  wash.addColorStop(1, "#6d28d9");
  context.fillStyle = wash;
  context.fillRect(0, band, width, foot - band);
  context.fillStyle = "#6d28d9";
  context.fillRect(0, foot, width, height - foot);
  context.fillStyle = "rgb(255 255 255 / 0.3)";
  context.fillRect(0, band, width, Math.max(1, body.height * 0.006));

  if (first) front(context, first, size, band);
  if (second) back(context, second, band);
};
