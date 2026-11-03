import { materials } from "@repo/dieline-core/data/materials";
import {
  closedPathD,
  parseCustomization,
  parseDocument,
  toFoldSVG,
  toSVG,
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

/**
 * The size a customer typed, turned into the crease-to-crease size the template
 * is drawn at. Same rule as the site has always used: an inner size grows by the
 * material's inner offset on both sides; an outer size shrinks by the thickness
 * (the material's own outer offset when the thickness was not changed).
 */
export function manufactureSize(raw: Size, type: DimensionType, materialKey: string, thickness: number): Size {
  if (type === "manufacture") return { ...raw };
  const material = materials.find((m) => m.value === materialKey) ?? materials[0]!;
  const inner = material.offset.inner * 2;
  const outer = (thickness !== material.thickness ? thickness : material.offset.outer) * 2;
  const d = type === "inner" ? inner : -outer;
  return { width: raw.width + d, length: raw.length + d, height: raw.height + d };
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
export function previewSvg(result: RenderResult, options: { watermark: boolean; rulers: boolean }): string {
  const svg = toSVG(result, { includeRulers: options.rulers, includeBleed: true, nonScalingStroke: true, strokeWidth: 1.2 });
  if (!options.watermark) return svg;

  const box = /viewBox="([^"]+)"/.exec(svg)?.[1]?.split(" ").map(Number);
  if (!box || box.length !== 4) return svg;
  const [x, y, w, h] = box as [number, number, number, number];
  // Large tiles, so the mark reads at any size; the 3D model uses the same (watermarkTile).
  const tile = Math.max(110, Math.min(w, h));
  // Only the printed sheet is marked: inside the bleed, or the cut outline without one.
  const sheet = closedPathD(result.bleed.length ? result.bleed : result.paths.filter((p) => p.lineType === "cut"));
  const clip = sheet ? `<clipPath id="watermark-sheet"><path d="${sheet}" clip-rule="evenodd"/></clipPath>` : "";
  return svg.replace(
    "</svg>",
    `<defs><pattern id="watermark" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${tile}" height="${tile}">` +
      `<image href="/watermark.png" width="${tile}" height="${tile}" opacity="0.5" preserveAspectRatio="xMidYMid meet"/></pattern>${clip}</defs>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#watermark)"${clip ? ` clip-path="url(#watermark-sheet)"` : ""} pointer-events="none"/></svg>`,
  );
}

export { toFoldSVG };
