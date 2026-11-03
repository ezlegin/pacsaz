import { add, distance, scale, sub, sweep } from "../geometry/math";
import type { Path, Pt } from "../geometry/types";
import type { LineType } from "../spec/types";

export type NickOptions = {
  /** Width of each bridge, in mm. Typical: 0.3–0.5 for carton, 0.8–1.5 for corrugated. */
  width: number;
  /** About one nick per this much line, in mm. */
  spacing: number;
  /** Lines shorter than this get no nick, so small details stay clean. */
  minLength?: number;
  /** Which lines are nicked; cut lines by default. */
  lineTypes?: LineType[];
};

/**
 * Nicks (ties, bridges) are tiny gaps in the knife that keep the cut pieces
 * attached to the sheet until stripping. They are spread evenly along each line:
 * a line of length L gets floor(L / spacing) nicks (at least one once it is
 * longer than `minLength`), each centred in its share of the line.
 */
export function addNicks(paths: Path[], options: NickOptions): Path[] {
  const width = Math.max(0, options.width);
  const spacing = Math.max(width * 4, options.spacing);
  const minLength = options.minLength ?? Math.max(spacing / 2, width * 10);
  const types = new Set<LineType>(options.lineTypes ?? ["cut"]);
  if (width <= 0) return paths;

  const out: Path[] = [];
  for (const p of paths) {
    if (!types.has(p.lineType) || p.kind === "circle") {
      out.push(p);
      continue;
    }

    const length = p.kind === "line" ? distance(p.a, p.b) : (sweep(p.start, p.end) / 360) * 2 * Math.PI * p.r;
    const count = length < minLength ? 0 : Math.max(1, Math.floor(length / spacing));
    if (count === 0 || length <= width * (count + 1)) {
      out.push(p);
      continue;
    }

    // Gap k sits centred at (k + ½) / count of the way along the line.
    const pieces: [number, number][] = [];
    let from = 0;
    for (let k = 0; k < count; k++) {
      const centre = ((k + 0.5) / count) * length;
      pieces.push([from, centre - width / 2]);
      from = centre + width / 2;
    }
    pieces.push([from, length]);

    for (const [s, e] of pieces) {
      if (p.kind === "line") {
        const dir = scale(sub(p.b, p.a), 1 / length);
        const a: Pt = add(p.a, scale(dir, s));
        const b: Pt = add(p.a, scale(dir, e));
        out.push({ ...p, a, b });
      } else {
        const total = sweep(p.start, p.end);
        out.push({ ...p, start: p.start + (total * s) / length, end: p.start + (total * e) / length });
      }
    }
  }
  return out;
}
