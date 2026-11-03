import type { RenderResult, RulerInfo } from "../eval/render";
import { closedLoops } from "./bleed";
import { pathsBounds } from "./math";
import type { Pt } from "./types";

/**
 * The printed sheet and its parts, read from the rendered cut lines.
 *
 * A dieline can have several separate parts (a two-piece box), and windows cut
 * out of a panel. A closed cut loop inside another one is a hole; the others are
 * the outlines of the parts.
 */

function inside(p: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit;
  }
  return hit;
}

export function cutParts(result: RenderResult): { outlines: Pt[][]; holes: Pt[][] } {
  const loops = closedLoops(result.paths.filter((p) => p.lineType === "cut"));
  const outlines: Pt[][] = [];
  const holes: Pt[][] = [];
  loops.forEach((loop, i) => {
    const within = loops.some((other, j) => j !== i && other.length > 2 && inside(loop[0]!, other) && !inside(other[0]!, loop));
    (within ? holes : outlines).push(loop);
  });
  return { outlines, holes };
}

/**
 * Loops that fill the printed sheet with the even-odd rule: the bleed outline
 * (or the parts' outlines without a bleed) with every window left open, since
 * nothing is printed where the board is cut away.
 */
export function sheetLoops(result: RenderResult): Pt[][] {
  const { outlines, holes } = cutParts(result);
  const bleed = closedLoops(result.bleed);
  return [...(bleed.length ? bleed : outlines), ...holes];
}

/**
 * Overall size of each part: its width under it and its height on its left,
 * clear of the bleed. Computed, never stored in the document.
 */
export function overallRulers(result: RenderResult, gap = 8): RulerInfo[] {
  // The bleed sticks out as far as it is wide: keep the rulers outside it.
  const bleed = pathsBounds(result.bleed);
  const cut = pathsBounds(result.paths.filter((p) => p.lineType === "cut"));
  const clear = gap + (bleed && cut ? Math.max(0, cut.minY - bleed.minY) : 0);
  return cutParts(result).outlines.flatMap((loop, i) => {
    const xs = loop.map((p) => p[0]);
    const ys = loop.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    // Rulers measure along from→to and are offset along its left-hand normal.
    return [
      { id: `overall-w-${i}`, name: `overallWidth${i}`, from: [maxX, minY], to: [minX, minY], offset: clear, value: maxX - minX },
      { id: `overall-h-${i}`, name: `overallHeight${i}`, from: [minX, minY], to: [minX, maxY], offset: clear, value: maxY - minY },
    ] satisfies RulerInfo[];
  });
}
