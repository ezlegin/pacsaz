import type { RenderResult, RulerInfo } from "../eval/render";
import { closedLoops } from "../geometry/bleed";
import { overallRulers, sheetLoops } from "../geometry/sheet";
import { add, angleOf, polar, scale, sub, unit, unionBounds, pathsBounds, sweep } from "../geometry/math";
import type { Bounds, Path, Prim, Pt } from "../geometry/types";
import type { LineType } from "../spec/types";
import { addNicks, type NickOptions } from "./nicks";
import { LINE_STYLES, type LineStyle } from "./styles";

export type SvgOptions = {
  /** Base stroke width in millimetres. */
  strokeWidth?: number;
  /** Empty space around the drawing, in millimetres. */
  padding?: number;
  includeGuides?: boolean;
  includeRulers?: boolean;
  includeBleed?: boolean;
  /** Tag each path with `data-node-id` so a viewer can map clicks back to nodes. */
  nodeIds?: boolean;
  /** Keep strokes the same on screen at any zoom. For on-screen previews only. */
  nonScalingStroke?: boolean;
  styles?: Partial<Record<LineType, Partial<LineStyle>>>;
  /** Leave bridges in the cut lines, as the die will have them. */
  nicks?: NickOptions;
  rulerColor?: string;
  rulerFontSize?: number;
  /** Add each part's overall width and height (computed, not from the document). Independent of `includeRulers`. */
  overallRulers?: boolean;
  /**
   * Size the drawing as if every ruler (the template's and the overall ones) were
   * shown, so turning rulers on and off in a viewer does not move the drawing.
   */
  reserveRulers?: boolean;
  /** Fill the printed sheet (inside the bleed, windows left open) with this colour. On-screen previews only. */
  sheetFill?: string;
};

const fmt = (n: number) => {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
};

// SVG's Y axis points down; the engine's points up.
const flip = (p: Pt): string => `${fmt(p[0])} ${fmt(-p[1])}`;

function primToD(prim: Prim): string {
  switch (prim.kind) {
    case "line":
      return `M${flip(prim.a)}L${flip(prim.b)}`;
    case "circle": {
      // Two half arcs, because one SVG arc cannot draw a full circle.
      const left: Pt = [prim.c[0] - prim.r, prim.c[1]];
      const right: Pt = [prim.c[0] + prim.r, prim.c[1]];
      const r = fmt(prim.r);
      return `M${flip(left)}A${r} ${r} 0 1 0 ${flip(right)}A${r} ${r} 0 1 0 ${flip(left)}`;
    }
    case "arc": {
      const from = polar(prim.start, prim.r, prim.c);
      const to = polar(prim.end, prim.r, prim.c);
      const s = sweep(prim.start, prim.end);
      const r = fmt(prim.r);
      // Counter-clockwise in Y-up space is counter-clockwise on screen after the
      // flip too, which SVG calls sweep-flag 0.
      if (s >= 359.999) {
        const half = polar(prim.start + 180, prim.r, prim.c);
        return `M${flip(from)}A${r} ${r} 0 1 0 ${flip(half)}A${r} ${r} 0 1 0 ${flip(from)}`;
      }
      return `M${flip(from)}A${r} ${r} 0 ${s > 180 ? 1 : 0} 0 ${flip(to)}`;
    }
  }
}

/**
 * The closed loops formed by `prims` as filled SVG path data, in the same
 * flipped coordinates as `toSVG`. Separate line pieces have no area of their
 * own, so this is what a clip path or a fill needs (a watermark kept inside the
 * bleed, for one).
 */
export function closedPathD(prims: readonly Prim[]): string {
  return loopsD(closedLoops(prims));
}

/** Closed loops as SVG path data, in `toSVG`'s flipped coordinates. */
export function loopsD(loops: readonly Pt[][]): string {
  return loops
    .filter((loop) => loop.length >= 3)
    .map((loop) => `M${loop.map(flip).join("L")}Z`)
    .join("");
}

function strokeAttrs(style: LineStyle, base: number, nonScaling: boolean): string {
  const width = base * style.weight;
  const dash = style.dash.length
    ? ` stroke-dasharray="${style.dash.map((d) => fmt(nonScaling ? d * 4 : d)).join(" ")}"`
    : "";
  const vector = nonScaling ? ` vector-effect="non-scaling-stroke"` : "";
  return `stroke="${style.color}" stroke-width="${fmt(width)}"${dash}${vector}`;
}

/** The bounds an SVG of this result will show, before padding. */
export function exportBounds(result: RenderResult, options: SvgOptions = {}): Bounds | null {
  let b = options.includeGuides ? pathsBounds(result.paths) : result.bounds;
  if (options.includeBleed) b = unionBounds(b, pathsBounds(result.bleed));
  const sized = options.reserveRulers ? shownRulers(result, { includeRulers: true, overallRulers: true }) : shownRulers(result, options);
  for (const r of sized) b = unionBounds(b, pathsBounds(rulerPrims(r)));
  return b;
}

export function toSVG(result: RenderResult, options: SvgOptions = {}): string {
  const base = options.strokeWidth ?? 0.3;
  const pad = options.padding ?? 5;
  const nonScaling = !!options.nonScalingStroke;
  const style = (type: LineType): LineStyle => ({ ...LINE_STYLES[type], ...options.styles?.[type] });

  const b = exportBounds(result, options) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const width = b.maxX - b.minX + pad * 2;
  const height = b.maxY - b.minY + pad * 2;
  const viewBox = `${fmt(b.minX - pad)} ${fmt(-b.maxY - pad)} ${fmt(width)} ${fmt(height)}`;

  const body: string[] = [];

  if (options.sheetFill) {
    const d = loopsD(sheetLoops(result));
    if (d) body.push(`<path d="${d}" fill="${options.sheetFill}" fill-rule="evenodd" stroke="none"/>`);
  }

  if (options.includeBleed && result.bleed.length) {
    body.push(
      `<path d="${result.bleed.map(primToD).join("")}" fill="none" stroke="#22c55e" stroke-width="${fmt(base * 0.6)}"${nonScaling ? ` vector-effect="non-scaling-stroke"` : ""}/>`,
    );
  }

  // One <path> per node and line type keeps the file small and each piece clickable.
  const groups = new Map<string, Path[]>();
  const paths = options.nicks ? addNicks(result.paths, options.nicks) : result.paths;
  for (const p of paths) {
    if (p.lineType === "guide" && !options.includeGuides) continue;
    const key = `${p.nodeId}\u0000${p.lineType}`;
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }

  for (const paths of groups.values()) {
    const first = paths[0]!;
    const id = options.nodeIds ? ` data-node-id="${escapeAttr(first.nodeId)}"` : "";
    body.push(
      `<path${id} data-line-type="${first.lineType}" d="${paths.map(primToD).join("")}" fill="none" ${strokeAttrs(style(first.lineType), base, nonScaling)}/>`,
    );
  }

  const color = options.rulerColor ?? "#0ea5e9";
  const fontSize = options.rulerFontSize ?? 3.5;
  for (const ruler of shownRulers(result, options)) body.push(rulerSVG(ruler, color, fontSize, base, nonScaling));

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${fmt(width)}mm" height="${fmt(height)}mm" stroke-linecap="round" stroke-linejoin="round">` +
    body.join("") +
    `</svg>`
  );
}

//! Rulers -------------------------------------------------------------------------

function shownRulers(result: RenderResult, options: SvgOptions): RulerInfo[] {
  return [...(options.includeRulers ? result.rulers : []), ...(options.overallRulers ? overallRulers(result) : [])];
}

/** The dimension line's two ends, `a` at `from`, after the offset. */
export function rulerEnds(r: RulerInfo): { a: Pt; b: Pt; dir: Pt; normal: Pt } {
  const dir = unit(sub(r.to, r.from));
  const normal: Pt = [-dir[1], dir[0]];
  const shift = scale(normal, r.offset);
  return { a: add(r.from, shift), b: add(r.to, shift), dir, normal };
}

/** Extension lines and the dimension line of a ruler, for any renderer. Arrows are drawn by `rulerArrows`. */
export function rulerPrims(r: RulerInfo): Prim[] {
  const { a, b, normal } = rulerEnds(r);
  // Extension lines run a little past the dimension line, as on a drawing.
  const over = scale(normal, Math.sign(r.offset || 1) * 1.5);
  return [
    { kind: "line", a: r.from, b: add(a, over) },
    { kind: "line", a: r.to, b: add(b, over) },
    { kind: "line", a, b },
  ];
}

/** Filled arrowheads at both ends of the dimension line, pointing outwards, `size` long. */
export function rulerArrows(r: RulerInfo, size: number): [Pt, Pt, Pt][] {
  const { a, b, dir, normal } = rulerEnds(r);
  const head = (tip: Pt, back: Pt): [Pt, Pt, Pt] => {
    const base = add(tip, scale(back, size));
    return [tip, add(base, scale(normal, size * 0.35)), sub(base, scale(normal, size * 0.35))];
  };
  return [head(a, dir), head(b, scale(dir, -1))];
}

/** "60 mm", as the label reads. */
export function rulerLabel(r: RulerInfo): string {
  return `${fmt(Math.round(r.value * 10) / 10)} mm`;
}

function rulerSVG(r: RulerInfo, color: string, fontSize: number, base: number, nonScaling: boolean): string {
  const prims = rulerPrims(r);
  const { a, b, dir } = rulerEnds(r);
  const size = fontSize * 0.9;

  // Keep the label readable: never upside down. It sits on the line, which a
  // white halo breaks around it.
  let angle = -angleOf(dir);
  if (angle > 90 || angle <= -90) angle += 180;
  const mid = flip(scale(add(a, b), 0.5)).split(" ");
  const text = (attrs: string) =>
    `<text ${attrs} fill="${color}" font-size="${fmt(fontSize)}" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" stroke="#ffffff" stroke-width="${fmt(fontSize * 0.5)}" paint-order="stroke">${rulerLabel(r)}</text>`;

  let marks: string;
  if (nonScaling) {
    // On screen, arrows and label are drawn around their own anchor and scaled by
    // the CSS variable --ruler-scale, so a zoomable viewer keeps them the same size
    // on screen at any zoom, as the editor does.
    const at = (p: Pt, deg: number) => {
      const [x, y] = flip(p).split(" ");
      return `style="transform: translate(${x}px, ${y}px) rotate(${fmt(deg)}deg) scale(var(--ruler-scale, 1))"`;
    };
    const head = `M0 0L${fmt(size)} ${fmt(size * 0.35)}L${fmt(size)} ${fmt(-size * 0.35)}Z`;
    // The back of the head points along the line, into the ruler.
    const back = -angleOf(dir);
    marks =
      `<path d="${head}" fill="${color}" stroke="none" ${at(a, back)}/>` +
      `<path d="${head}" fill="${color}" stroke="none" ${at(b, back + 180)}/>` +
      text(`x="0" y="0" ${at(scale(add(a, b), 0.5), angle)}`);
  } else {
    const arrows = rulerArrows(r, size).map((t) => `M${t.map(flip).join("L")}Z`).join("");
    const [x, y] = mid;
    marks = `<path d="${arrows}" fill="${color}" stroke="none"/>` + text(`x="${x}" y="${y}" transform="rotate(${fmt(angle)} ${x} ${y})"`);
  }

  return (
    `<g data-ruler-id="${escapeAttr(r.id)}">` +
    `<path d="${prims.map(primToD).join("")}" fill="none" stroke="${color}" stroke-width="${fmt(base * 0.6)}"${nonScaling ? ` vector-effect="non-scaling-stroke"` : ""}/>` +
    marks +
    `</g>`
  );
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
