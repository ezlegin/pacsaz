import type { RenderResult, RulerInfo } from "../eval/render";
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
  if (options.includeRulers) {
    for (const r of result.rulers) b = unionBounds(b, pathsBounds(rulerPrims(r)));
  }
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

  if (options.includeRulers) {
    const color = options.rulerColor ?? "#0ea5e9";
    const fontSize = options.rulerFontSize ?? 3.5;
    for (const ruler of result.rulers) body.push(rulerSVG(ruler, color, fontSize, base, nonScaling));
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${fmt(width)}mm" height="${fmt(height)}mm" stroke-linecap="round" stroke-linejoin="round">` +
    body.join("") +
    `</svg>`
  );
}

//! Rulers -------------------------------------------------------------------------

/** Extension lines, dimension line and ticks of a ruler. */
function rulerPrims(r: RulerInfo): Prim[] {
  const dir = unit(sub(r.to, r.from));
  const normal: Pt = [-dir[1], dir[0]];
  const shift = scale(normal, r.offset);
  const a = add(r.from, shift);
  const b = add(r.to, shift);
  const tick = scale(add(dir, normal), 1.2);

  return [
    { kind: "line", a: r.from, b: a },
    { kind: "line", a: r.to, b },
    { kind: "line", a, b },
    { kind: "line", a: sub(a, tick), b: add(a, tick) },
    { kind: "line", a: sub(b, tick), b: add(b, tick) },
  ];
}

function rulerSVG(r: RulerInfo, color: string, fontSize: number, base: number, nonScaling: boolean): string {
  const prims = rulerPrims(r);
  const dir = unit(sub(r.to, r.from));
  const normal: Pt = [-dir[1], dir[0]];
  const midPoint = add(scale(add(r.from, r.to), 0.5), scale(normal, r.offset + fontSize * 0.4));

  // Keep the label readable: never upside down.
  let angle = -angleOf(dir);
  if (angle > 90 || angle <= -90) angle += 180;

  const [x, y] = flip(midPoint).split(" ");
  return (
    `<g data-ruler-id="${escapeAttr(r.id)}">` +
    `<path d="${prims.map(primToD).join("")}" fill="none" stroke="${color}" stroke-width="${fmt(base * 0.6)}"${nonScaling ? ` vector-effect="non-scaling-stroke"` : ""}/>` +
    `<text x="${x}" y="${y}" fill="${color}" font-size="${fmt(fontSize)}" font-family="sans-serif" text-anchor="middle" transform="rotate(${fmt(angle)} ${x} ${y})">${fmt(Math.round(r.value * 10) / 10)}</text>` +
    `</g>`
  );
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
