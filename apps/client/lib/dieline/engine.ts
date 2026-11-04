import {
  loopsD,
  parseCustomization,
  parseDocument,
  resolveDimensions,
  sheetLoops,
  toFoldSVG,
  toSVG,
  typedRulers,
  type Customization,
  type DielineDocument,
  type RenderResult,
} from "@repo/dieline-engine";

/**
 * The client app's bridge to `@repo/dieline-engine`. Shared by the browser
 * (preview) and the server (downloads), so it must stay free of React and Redux.
 */

/** The template stored in `Dieline.specification`, or null for an old-format or broken one. */
export function loadTemplate(specification: string): DielineDocument | null {
  try {
    const parsed = parseDocument(JSON.parse(specification));
    return parsed.ok ? parsed.document : null;
  } catch {
    return null;
  }
}

/** A stored customization; anything unreadable counts as no customization. */
export function loadCustomization(json: string | null | undefined): Customization {
  if (!json) return {};
  try {
    const parsed = parseCustomization(JSON.parse(json));
    return parsed.ok ? parsed.customization : {};
  } catch {
    return {};
  }
}

export type DimensionType = "manufacture" | "inner" | "outer";
export type Size = { width: number; length: number; height: number };

/** The size a customer typed, as the crease-to-crease size the template is drawn at. */
export const manufactureSize = resolveDimensions;

/** The reverse of `manufactureSize`: a box's crease size in the numbers of a dimension type. */
export function typedSize(crease: Size, type: DimensionType, thickness: number): Size {
  const grown = manufactureSize(crease, type, thickness);
  const n = (key: keyof Size) => Math.round((2 * crease[key] - grown[key]) * 100) / 100;
  return { width: n("width"), length: n("length"), height: n("height") };
}

/** Keeps a requested size inside what the template is sold in. */
export function clampSize(raw: Size, min: Size, max: Size): Size {
  const c = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi > 0 ? hi : Number.POSITIVE_INFINITY);
  return { width: c(raw.width, min.width, max.width), length: c(raw.length, min.length, max.length), height: c(raw.height, min.height, max.height) };
}

/**
 * The drawing shown on the product page. Strokes keep their width on screen at
 * any zoom; visitors who are not signed in see it under a watermark.
 */
function rulerFont(result: RenderResult): number {
  const b = result.bounds;
  return b ? Math.max(4, Math.max(b.maxX - b.minX, b.maxY - b.minY) / 40) : 4;
}

export function previewSvg(result: RenderResult, options: { watermark: boolean; overallRulers: boolean; size?: Size; typed?: Size }): string {
  // The drawing is at the crease size; rulers show the number the customer typed.
  const { size, typed } = options;
  if (size && typed) {
    const delta = { width: size.width - typed.width, length: size.length - typed.length, height: size.height - typed.height };
    result = { ...result, rulers: typedRulers(result, size, delta) };
  }
  // White paper inside the bleed (windows left open), the template's rulers
  // always, and each part's overall size when the visitor has it on. Room for
  // every ruler is kept either way, so the toggle never moves the drawing.
  const svg = toSVG(result, {
    includeRulers: true,
    overallRulers: options.overallRulers,
    reserveRulers: true,
    includeBleed: true,
    nonScalingStroke: true,
    strokeWidth: 1.2,
    sheetFill: "#ffffff",
    // The preview is scaled to fit, so labels grow with the drawing to stay readable.
    rulerFontSize: rulerFont(result),
  });
  if (!options.watermark) return svg;

  const box = /viewBox="([^"]+)"/.exec(svg)?.[1]?.split(" ").map(Number);
  if (!box || box.length !== 4) return svg;
  const [x, y, w, h] = box as [number, number, number, number];
  // Large tiles, so the mark reads at any size; the 3D model uses the same (watermarkTile).
  const tile = Math.max(110, Math.min(w, h));
  // Only the printed sheet is marked: inside the bleed (or the outline without one), never over a window.
  const sheet = loopsD(sheetLoops(result));
  const clip = sheet ? `<clipPath id="watermark-sheet"><path d="${sheet}" clip-rule="evenodd"/></clipPath>` : "";
  return svg.replace(
    "</svg>",
    `<defs><pattern id="watermark" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${tile}" height="${tile}">` +
      `<image href="/watermark.png" width="${tile}" height="${tile}" opacity="0.5" preserveAspectRatio="xMidYMid meet"/></pattern>${clip}</defs>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#watermark)"${clip ? ` clip-path="url(#watermark-sheet)"` : ""} pointer-events="none"/></svg>`,
  );
}

export { toFoldSVG };
