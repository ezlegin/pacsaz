import type { RenderResult } from "../eval/render";
import { polar, sweep } from "../geometry/math";
import { cutParts } from "../geometry/sheet";
import type { Path, Pt } from "../geometry/types";
import type { LineType } from "../spec/types";

/**
 * The layered SVG the 3D fold rig (`@repo/dieline-3d`) reads: one path each with
 * the ids `trim`, `fold` and `perf`, plus `window` with each window's outline.
 * Arcs are written as short chords because the rig works on straight segments
 * anyway.
 *
 * A fold the drawing interrupts at a window is written whole: the panels either
 * side are still hinged along that line. The rig drops the pieces of board the
 * whole fold makes inside a window, using the `window` outlines.
 */
const LAYER: Partial<Record<LineType, "trim" | "fold" | "perf">> = {
  cut: "trim",
  crease: "fold",
  reverseCrease: "fold",
  cutCrease: "fold",
  perf: "perf",
};

const f = (n: number) => String(Math.round(n * 1000) / 1000);
// SVG's Y axis points down.
const pt = (p: Pt) => `${f(p[0])} ${f(-p[1])}`;

function polyline(p: Path): Pt[] {
  if (p.kind === "line") return [p.a, p.b];
  const start = p.kind === "arc" ? p.start : 0;
  const total = p.kind === "arc" ? sweep(p.start, p.end) : 360;
  const steps = Math.max(2, Math.ceil(total / 6));
  return Array.from({ length: steps + 1 }, (_, i) => polar(start + (total * i) / steps, p.r, p.c));
}

export function toFoldSVG(result: RenderResult): string {
  const layers: Record<"trim" | "fold" | "perf", string[]> = { trim: [], fold: [], perf: [] };
  for (const p of [...result.paths, ...result.foldsInHoles]) {
    const layer = LAYER[p.lineType];
    if (!layer) continue;
    const pts = polyline(p);
    layers[layer].push(`M ${pts.map(pt).join(" L ")}`);
  }

  const b = result.bounds ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  const viewBox = `${f(b.minX)} ${f(-b.maxY)} ${f(b.maxX - b.minX)} ${f(b.maxY - b.minY)}`;
  const paths = (Object.keys(layers) as (keyof typeof layers)[])
    .filter((k) => layers[k].length)
    .map((k) => `<path id="${k}" d="${layers[k].join(" ")}"/>`)
    .join("");
  const windows = result.foldsInHoles.length
    ? cutParts(result).holes.map((h) => `<path id="window" d="M ${h.map(pt).join(" L ")} Z"/>`).join("")
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g id="svgGroup" fill="none" stroke="#000">${paths}${windows}</g></svg>`;
}
