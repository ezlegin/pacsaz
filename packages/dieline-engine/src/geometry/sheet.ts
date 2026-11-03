import type { RenderResult, RulerInfo } from "../eval/render";
import { closedLoops, isHole } from "./bleed";
import { pathsBounds } from "./math";
import type { Pt } from "./types";

/**
 * The printed sheet and its parts, read from the rendered cut lines.
 *
 * A dieline can have several separate parts (a two-piece box), and windows cut
 * out of a panel. A closed cut loop inside another one is a hole; the others are
 * the outlines of the parts.
 */

export function cutParts(result: RenderResult): { outlines: Pt[][]; holes: Pt[][] } {
  const loops = closedLoops(result.paths.filter((p) => p.lineType === "cut"));
  const outlines: Pt[][] = [];
  const holes: Pt[][] = [];
  for (const loop of loops) (isHole(loop, loops) ? holes : outlines).push(loop);
  return { outlines, holes };
}

/**
 * Loops that fill the printed sheet with the even-odd rule: the bleed loops
 * (or the parts' outlines without a bleed) with every window left open, since
 * nothing is printed where the board is cut away.
 */
export function sheetLoops(result: RenderResult): Pt[][] {
  // The bleed already holds every window, grown into its opening.
  const bleed = closedLoops(result.bleed);
  if (bleed.length) return bleed;
  const { outlines, holes } = cutParts(result);
  return [...outlines, ...holes];
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
