import { polar, sweep } from "./math";
import type { Prim, Pt } from "./types";

/**
 * Bleed: the outer cut contour grown by `distance`, with round outside corners.
 *
 * makerjs' outline works but takes seconds on a carton and leaves stray inner
 * offsets when it misreads a chain, so bleed has its own small offsetter: chain
 * the cut lines into closed loops, keep the outermost, offset its edges outward,
 * join convex corners with arcs and concave ones by intersection, then cut away
 * the little loops a narrow notch (a dust-flap gap, a slot) folds into.
 */

const KEY = 100; // endpoints within 0.01 mm are the same point
const key = (p: Pt) => `${Math.round(p[0] * KEY)},${Math.round(p[1] * KEY)}`;
const ARC_STEP = 5; // degrees per chord when flattening
const JOIN_STEP = 10; // degrees per chord of a round corner

function flatten(prim: Prim): Pt[] {
  if (prim.kind === "line") return [prim.a, prim.b];
  const start = prim.kind === "arc" ? prim.start : 0;
  const total = prim.kind === "arc" ? sweep(prim.start, prim.end) : 360;
  const steps = Math.max(1, Math.ceil(total / ARC_STEP));
  return Array.from({ length: steps + 1 }, (_, i) => polar(start + (total * i) / steps, prim.r, prim.c));
}

const signedArea = (poly: Pt[]) => {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
};

/** Closed loops formed by the pieces; open ends are ignored. */
export function closedLoops(prims: readonly Prim[]): Pt[][] {
  const pieces = prims.map(flatten).filter((p) => p.length >= 2);
  const at = new Map<string, number[]>();
  pieces.forEach((p, i) => {
    for (const end of [p[0]!, p[p.length - 1]!]) {
      const k = key(end);
      const list = at.get(k);
      if (list) list.push(i);
      else at.set(k, [i]);
    }
  });

  const used = new Set<number>();
  const loops: Pt[][] = [];
  for (let s = 0; s < pieces.length; s++) {
    if (used.has(s)) continue;
    used.add(s);
    const first = pieces[s]!;
    // A full circle closes on itself.
    if (key(first[0]!) === key(first[first.length - 1]!)) {
      loops.push(first.slice(0, -1));
      continue;
    }
    const loop = [...first];
    const startKey = key(first[0]!);
    for (;;) {
      const endKey = key(loop[loop.length - 1]!);
      if (endKey === startKey) break;
      const next = (at.get(endKey) ?? []).find((i) => !used.has(i));
      if (next === undefined) break;
      used.add(next);
      const piece = pieces[next]!;
      const forward = key(piece[0]!) === endKey;
      loop.push(...(forward ? piece : [...piece].reverse()).slice(1));
    }
    if (key(loop[loop.length - 1]!) === startKey && loop.length > 3) loops.push(loop.slice(0, -1));
  }
  return loops;
}

function cleaned(poly: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of poly) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-6) out.push(p);
  }
  while (out.length > 1 && Math.hypot(out[0]![0] - out[out.length - 1]![0], out[0]![1] - out[out.length - 1]![1]) <= 1e-6) out.pop();
  return out;
}

function intersect(a: Pt, b: Pt, c: Pt, d: Pt): { p: Pt; t: number; u: number } | null {
  const r: Pt = [b[0] - a[0], b[1] - a[1]];
  const s: Pt = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-12) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return { p: [a[0] + t * r[0], a[1] + t * r[1]], t, u };
}

/** Naive outward offset of a counter-clockwise polygon, round joins outside. */
function rawOffset(poly: Pt[], d: number): Pt[] {
  const n = poly.length;
  const out: Pt[] = [];
  const normal = (a: Pt, b: Pt): Pt => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[1] - a[1]) / len, -(b[0] - a[0]) / len];
  };
  for (let i = 0; i < n; i++) {
    const prev = poly[(i - 1 + n) % n]!;
    const p = poly[i]!;
    const next = poly[(i + 1) % n]!;
    const n0 = normal(prev, p);
    const n1 = normal(p, next);
    const cross = (p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0]);
    const a: Pt = [p[0] + n0[0] * d, p[1] + n0[1] * d];
    const b: Pt = [p[0] + n1[0] * d, p[1] + n1[1] * d];

    if (cross > 1e-9) {
      // Convex corner: the outside turns counter-clockwise from n0 to n1.
      const from = (Math.atan2(n0[1], n0[0]) * 180) / Math.PI;
      const total = sweep(from, (Math.atan2(n1[1], n1[0]) * 180) / Math.PI);
      const steps = Math.max(1, Math.ceil(total / JOIN_STEP));
      for (let k = 0; k <= steps; k++) out.push(polar(from + (total * k) / steps, d, p));
    } else if (cross < -1e-9) {
      // Concave corner: go through the corner itself. Where the edges are long
      // enough the overlap is a small loop that `untangle` cuts off at the
      // crossing; in a narrow V (a dust flap beside a lid) the lines would only
      // meet far beyond both edges, so intersecting them here would be wrong.
      out.push(a, p, b);
    } else {
      out.push(a);
    }
  }
  return cleaned(out);
}

/** Cuts away the loops an offset folds into where a notch is narrower than twice the bleed. */
function untangle(poly: Pt[]): Pt[] {
  let q = poly;
  for (let pass = 0; pass < 200; pass++) {
    const n = q.length;
    let changed = false;
    outer: for (let i = 0; i < n; i++) {
      const a = q[i]!;
      const b = q[(i + 1) % n]!;
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        const hit = intersect(a, b, q[j]!, q[(j + 1) % n]!);
        if (!hit || hit.t <= 1e-9 || hit.t >= 1 - 1e-9 || hit.u <= 1e-9 || hit.u >= 1 - 1e-9) continue;
        const inner = [hit.p, ...q.slice(i + 1, j + 1)];
        const rest = [hit.p, ...q.slice(j + 1), ...q.slice(0, i + 1)];
        // A folded-in loop is tiny next to the outline it hangs off (and often runs
        // the other way, so its area is smaller still): keep the bigger side.
        q = Math.abs(signedArea(inner)) > Math.abs(signedArea(rest)) ? inner : rest;
        changed = true;
        break outer;
      }
    }
    if (!changed) break;
  }
  return q;
}

function distanceTo(poly: Pt[], p: Pt): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy));
  }
  return best;
}

export function bleedOutline(cut: readonly Prim[], distance: number): Prim[] {
  if (!(distance > 0)) return [];
  const loops = closedLoops(cut);
  if (!loops.length) return [];

  let outer = cleaned(loops.reduce((best, l) => (Math.abs(signedArea(l)) > Math.abs(signedArea(best)) ? l : best)));
  if (outer.length < 3) return [];
  if (signedArea(outer) < 0) outer = [...outer].reverse();

  // Overlaps that only touch (a slot exactly as wide as the bleed, or twice as
  // wide) never cross, so untangling leaves them; a point closer to the cut
  // than the bleed can only belong to such a fold, and its neighbours join up.
  const poly = untangle(rawOffset(outer, distance)).filter((p) => distanceTo(outer, p) > distance - 1e-3);
  if (poly.length < 3) return [];
  return poly.map((p, i) => ({ kind: "line", a: p, b: poly[(i + 1) % poly.length]! }));
}
