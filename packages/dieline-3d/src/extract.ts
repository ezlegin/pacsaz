import { parsePathToPolylines, polylinesToSegments } from "./path";
import type { Pt, Segment, SegmentKind } from "./types";

/**
 * Extracts the dieline's foldable geometry from its exported SVG.
 *
 * makerjs tags each path with the layer it belongs to and wraps everything in a
 * single `<g id="svgGroup">`. A real export looks like:
 *
 *     <g id="svgGroup" stroke="#000" fill="none">
 *       <path d="…" id="bleed"/>
 *       <path d="…" id="container"/>
 *       <path d="M 125 195 125 35" id="fold"/>
 *       <path d="…" id="perf"/>
 *       <path d="…" id="trim"/>
 *     </g>
 *
 * The layer is therefore resolved from the element's **own `id`**, falling back to
 * the nearest enclosing foldable `<g>` for exports that group by layer instead.
 * Stroke colour and dashing are deliberately ignored: they are presentation, and
 * restyling the export must not change how it folds.
 *
 * Three things make this delicate:
 *
 * 1. `bleed` is a **filled** rect enclosing the whole pattern. Treated as
 *    geometry it becomes one giant face with the real dieline hidden inside it.
 * 2. The watermark pass appends `<defs>` whose `<clipPath>` contains the bleed
 *    outline as a `<path>`. Definitions are never geometry.
 * 3. `perf` (perforation) is extracted for display but must never affect the
 *    panel subdivision — see the note on `FOLDABLE`.
 */

/**
 * Layers that are extracted.
 *
 * `perf` is included so its position can be shown, but the fold rig keeps it out
 * of the planar subdivision: a perforation is a weakness line for folding or
 * tearing off, not a crease, so it must not split panels or create hinges.
 */
const FOLDABLE: Record<string, SegmentKind> = {
  trim: "trim",
  fold: "fold",
  perf: "perf",
};

const attr = (tag: string, name: string): string | null => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match ? match[1]! : null;
};

const num = (value: string | null): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** `<defs>` blocks hold patterns, masks and clip paths — never geometry. */
const stripDefinitions = (svg: string): string =>
  svg.replace(/<defs\b[\s\S]*?<\/defs>/gi, "");

/** Geometry of one element, in flat SVG coordinates. */
const segmentsOfElement = (
  name: string,
  attrs: string,
  kind: SegmentKind,
): Segment[] => {
  if (name === "path") {
    const d = attr(attrs, "d");
    if (!d || !d.trim()) return [];
    return polylinesToSegments(parsePathToPolylines(d), kind);
  }

  if (name === "line") {
    const a: Pt = [num(attr(attrs, "x1")), num(attr(attrs, "y1"))];
    const b: Pt = [num(attr(attrs, "x2")), num(attr(attrs, "y2"))];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-6) return [];
    return [{ a, b, kind }];
  }

  if (name === "polyline" || name === "polygon") {
    const raw = attr(attrs, "points");
    if (!raw) return [];

    const points = raw
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(",").map(Number) as Pt)
      .filter((p) => p.length === 2 && p.every(Number.isFinite));

    if (name === "polygon" && points.length > 1) points.push(points[0]!);
    return polylinesToSegments([points], kind);
  }

  if (name === "rect") {
    const x = num(attr(attrs, "x"));
    const y = num(attr(attrs, "y"));
    const w = num(attr(attrs, "width"));
    const h = num(attr(attrs, "height"));

    // Percentage-sized rects are page furniture, not geometry.
    if (!(w > 0) || !(h > 0)) return [];

    return polylinesToSegments(
      [
        [
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x, y + h],
          [x, y],
        ],
      ],
      kind,
    );
  }

  return [];
};

/**
 * Walks the SVG once, keeping a stack of enclosing `<g id>` values so an element
 * resolves its layer from either its own id or its group's.
 */
export const extractSegmentsFromSvg = (svg: string): Segment[] => {
  const clean = stripDefinitions(svg);

  const tokenPattern =
    /<g\b([^>]*?)\/?>|<\/g\s*>|<(path|line|polyline|polygon|rect)\b([^>]*?)\/?>/gi;

  const stack: string[] = [];
  const segments: Segment[] = [];

  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(clean)) !== null) {
    const [full, groupAttrs, elementName, elementAttrs] = match;

    if (full.startsWith("</g")) {
      stack.pop();
      continue;
    }

    if (groupAttrs !== undefined) {
      // A self-closing `<g/>` never encloses anything.
      if (!full.endsWith("/>")) stack.push(attr(groupAttrs, "id") ?? "");
      continue;
    }

    const name = elementName?.toLowerCase();
    if (!name) continue;

    const ownId = attr(elementAttrs ?? "", "id");
    let layer: string | undefined = ownId ?? undefined;

    if (!layer || !FOLDABLE[layer]) {
      // Fall back to the innermost enclosing foldable group.
      for (let i = stack.length - 1; i >= 0; i--) {
        const id = stack[i];
        if (id && FOLDABLE[id]) {
          layer = id;
          break;
        }
      }
    }

    const kind = layer ? FOLDABLE[layer] : undefined;
    // Unknown or non-foldable layers are skipped rather than guessed at: adding
    // bleed or anchor geometry produces phantom faces that break the trace.
    if (!kind) continue;

    segments.push(...segmentsOfElement(name, elementAttrs ?? "", kind));
  }

  return segments;
};

/**
 * True when the export contains a crease.
 *
 * Perforations do not count: a dieline with only perforations has nothing to fold,
 * which is a perfectly valid design.
 */
export const svgHasFoldLayer = (svg: string): boolean =>
  extractSegmentsFromSvg(svg).some((segment) => segment.kind === "fold");

/** Every `id` present in the export, for diagnostics. */
export const svgLayerIds = (svg: string): string[] => {
  const ids: string[] = [];
  const pattern = /\bid\s*=\s*"([^"]+)"/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(stripDefinitions(svg))) !== null) {
    const id = match[1]!;
    if (!ids.includes(id)) ids.push(id);
  }

  return ids;
};
