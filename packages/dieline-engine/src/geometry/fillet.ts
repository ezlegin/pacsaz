import { add, angleOf, distance, length, samePoint, scale, sub, unit } from "./math";
import { EPSILON, type Path, type Prim, type Pt } from "./types";

/**
 * Corner rounding for polylines.
 *
 * Every shape with corners (rect, polygon, star, path, and the `round`
 * modifier on any line chain) funnels through `filletPolyline`, so they all
 * share one exact construction instead of asking makerjs to fillet chains.
 *
 * For a corner with interior angle θ and radius r, the arc touches each edge at
 * distance d = r / tan(θ/2) from the corner. When two neighbouring corners ask
 * for more than their shared edge can give, both are scaled down in proportion,
 * so a too-large radius degrades into the largest one that fits instead of
 * failing.
 */

/** Interior angle at `v` between the edges towards `prev` and `next`, in radians. */
function interiorAngle(prev: Pt, v: Pt, next: Pt): number {
  const u = unit(sub(prev, v));
  const w = unit(sub(next, v));
  const dot = Math.min(1, Math.max(-1, u[0] * w[0] + u[1] * w[1]));
  return Math.acos(dot);
}

function isCorner(theta: number): boolean {
  // Straight-through or folded-back points are not corners.
  return theta > 1e-3 && theta < Math.PI - 1e-3;
}

export function filletPolyline(
  points: Pt[],
  closed: boolean,
  radiusAt: (index: number) => number,
): Prim[] {
  const n = points.length;
  if (n < 2) return [];

  const at = (i: number) => points[((i % n) + n) % n]!;
  const edgeCount = closed ? n : n - 1;

  // Tangent distance wanted at each corner.
  const want = new Array<number>(n).fill(0);
  const theta = new Array<number>(n).fill(Math.PI);

  for (let i = 0; i < n; i++) {
    if (!closed && (i === 0 || i === n - 1)) continue;

    const r = radiusAt(i);
    if (!(r > EPSILON)) continue;

    const t = interiorAngle(at(i - 1), at(i), at(i + 1));
    if (!isCorner(t)) continue;

    theta[i] = t;
    want[i] = r / Math.tan(t / 2);
  }

  // Scale corners down so neighbours never overlap on their shared edge.
  const factor = new Array<number>(n).fill(1);
  for (let e = 0; e < edgeCount; e++) {
    const i = e;
    const j = (e + 1) % n;
    const total = want[i]! + want[j]!;
    const edge = distance(at(i), at(j));
    if (total > edge && total > EPSILON) {
      const k = edge / total;
      factor[i] = Math.min(factor[i]!, k);
      factor[j] = Math.min(factor[j]!, k);
    }
  }

  const d = want.map((w, i) => w * factor[i]!);

  // Point where the straight part of each edge starts and ends.
  const out: Prim[] = [];
  const trimmedStart = (e: number): Pt => {
    const a = at(e);
    const b = at(e + 1);
    return d[e]! > 0 ? add(a, scale(unit(sub(b, a)), d[e]!)) : a;
  };
  const trimmedEnd = (e: number): Pt => {
    const a = at(e);
    const b = at(e + 1);
    const j = (e + 1) % n;
    return d[j]! > 0 ? add(b, scale(unit(sub(a, b)), d[j]!)) : b;
  };

  for (let e = 0; e < edgeCount; e++) {
    const a = trimmedStart(e);
    const b = trimmedEnd(e);
    if (!samePoint(a, b)) out.push({ kind: "line", a, b });

    const j = (e + 1) % n;
    if (d[j]! > 0 && (closed || j !== n - 1)) {
      const arc = cornerArc(at(e), at(j), at(j + 1), d[j]!, theta[j]!);
      if (arc) out.push(arc);
    }
  }

  return out;
}

/** The fillet arc at `v` that touches both edges `d` away from the corner. */
function cornerArc(prev: Pt, v: Pt, next: Pt, d: number, theta: number): Prim | null {
  const u = unit(sub(prev, v));
  const w = unit(sub(next, v));
  const bisector = unit(add(u, w));
  if (length(bisector) < EPSILON) return null;

  const r = d * Math.tan(theta / 2);
  const centreDistance = r / Math.sin(theta / 2);
  const c = add(v, scale(bisector, centreDistance));

  const a1 = angleOf(sub(add(v, scale(u, d)), c));
  const a2 = angleOf(sub(add(v, scale(w, d)), c));

  // The fillet is always the short arc; pick the direction that makes it so.
  const ccw = (((a2 - a1) % 360) + 360) % 360;
  return ccw <= 180
    ? { kind: "arc", c, r, start: a1, end: a2 }
    : { kind: "arc", c, r, start: a2, end: a1 };
}

/** Largest radius each corner of a polyline can take with its neighbours rounded too. */
export function fullRadii(points: Pt[], closed: boolean): number[] {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n]!;

  return points.map((_, i) => {
    if (!closed && (i === 0 || i === n - 1)) return 0;
    const t = interiorAngle(at(i - 1), at(i), at(i + 1));
    if (!isCorner(t)) return 0;
    const shortest = Math.min(distance(at(i - 1), at(i)), distance(at(i), at(i + 1)));
    return (shortest / 2) * Math.tan(t / 2);
  });
}

//! Chains ----------------------------------------------------------------------

export type LineChain = {
  points: Pt[];
  closed: boolean;
  template: Omit<Path, "a" | "b" | "kind" | "c" | "r" | "start" | "end">;
};

/**
 * Joins straight paths that share endpoints into polylines so their corners can
 * be rounded. Arcs and circles are returned untouched in `rest`.
 */
export function chainLines(paths: Path[]): { chains: LineChain[]; rest: Path[] } {
  const lines = paths.filter(
    (p): p is Extract<Path, { kind: "line" }> => p.kind === "line",
  );
  const rest = paths.filter((p) => p.kind !== "line");
  const used = new Array<boolean>(lines.length).fill(false);
  const chains: LineChain[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (used[i]) continue;
    used[i] = true;

    const first = lines[i]!;
    const points: Pt[] = [first.a, first.b];
    const sameKind = (p: Path) =>
      p.lineType === first.lineType && p.nodeId === first.nodeId;

    // Extend forward from the tail, then backward from the head.
    for (const forward of [true, false]) {
      let extended = true;
      while (extended) {
        extended = false;
        const tip = forward ? points[points.length - 1]! : points[0]!;
        for (let k = 0; k < lines.length; k++) {
          const line = lines[k]!;
          if (used[k] || !sameKind(line)) continue;

          let next: Pt | null = null;
          if (samePoint(line.a, tip)) next = line.b;
          else if (samePoint(line.b, tip)) next = line.a;
          if (!next) continue;

          used[k] = true;
          if (forward) points.push(next);
          else points.unshift(next);
          extended = true;
          break;
        }
      }
    }

    let closed = false;
    if (points.length > 3 && samePoint(points[0]!, points[points.length - 1]!)) {
      points.pop();
      closed = true;
    }

    chains.push({
      points,
      closed,
      template: { lineType: first.lineType, nodeId: first.nodeId },
    });
  }

  return { chains, rest };
}
