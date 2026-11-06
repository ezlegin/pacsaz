import { polar, sweep } from "./math";
import type { Path, Prim, Pt } from "./types";

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
// Float noise is snapped off first: two ends that meet can land either side of a
// half-step of the grid (126.12499999 and 126.12500001), and would never join.
const snap = (v: number) => Math.round(Math.round(v * 1e6) / 1e6 * KEY);
const key = (p: Pt) => `${snap(p[0])},${snap(p[1])}`;
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

/**
 * Splits pieces where another piece's end lands part way along them (a flap
 * standing on a panel's edge), so the walk can turn there.
 */
function splitAtTees(pieces: Pt[][]): Pt[][] {
  const ends = pieces.flatMap((p) => [p[0]!, p[p.length - 1]!]);
  const out: Pt[][] = [];
  for (const piece of pieces) {
    let current: Pt[] = [piece[0]!];
    for (let i = 1; i < piece.length; i++) {
      const a = piece[i - 1]!;
      const b = piece[i]!;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len2 = dx * dx + dy * dy;
      const hits = len2 < 1e-12 ? [] : ends
        .map((e) => ({ e, t: ((e[0] - a[0]) * dx + (e[1] - a[1]) * dy) / len2 }))
        .filter(({ e, t }) => t > 1e-4 && t < 1 - 1e-4 && Math.abs((e[0] - a[0]) * dy - (e[1] - a[1]) * dx) / Math.sqrt(len2) < 1 / KEY)
        .sort((x, y) => x.t - y.t);
      for (const { e } of hits) {
        current.push(e);
        out.push(current);
        current = [e];
      }
      current.push(b);
    }
    out.push(current);
  }
  return out;
}

/**
 * Drops slits: pieces with an end nothing else meets (a friction lock, a tear
 * slit), repeatedly, so a slit leaving an outline cannot lead the loop walk
 * into a dead end.
 */
function withoutSlits(pieces: Pt[][]): Pt[][] {
  let left = pieces;
  for (;;) {
    const count = new Map<string, number>();
    for (const p of left) {
      if (key(p[0]!) === key(p[p.length - 1]!)) continue;
      for (const end of [p[0]!, p[p.length - 1]!]) count.set(key(end), (count.get(key(end)) ?? 0) + 1);
    }
    const next = left.filter((p) => key(p[0]!) === key(p[p.length - 1]!) || (count.get(key(p[0]!))! > 1 && count.get(key(p[p.length - 1]!))! > 1));
    if (next.length === left.length) return left;
    left = next;
  }
}

/** Closed loops formed by the pieces; open ends are ignored. */
export function closedLoops(prims: readonly Prim[]): Pt[][] {
  const pieces = withoutSlits(splitAtTees(prims.map(flatten).filter((p) => p.length >= 2)));
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

/** Even-odd point in polygon. */
export function insidePolygon(p: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!;
    const b = poly[j]!;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit;
  }
  return hit;
}

/** A closed loop lying inside another one is a hole (a window); the rest are part outlines. */
export function isHole(loop: Pt[], loops: Pt[][]): boolean {
  return loops.some((other) => other !== loop && other.length > 2 && insidePolygon(loop[0]!, other) && !insidePolygon(other[0]!, loop));
}

/**
 * Grows `loop` by `distance` away from the board: outward for a part's outline,
 * into the opening for a window, so the print runs past every knife. Returns
 * nothing when a window is too small to keep an opening.
 */
function offsetLoop(loop: Pt[], distance: number, hole: boolean): Pt[] | null {
  let poly = cleaned(loop);
  if (poly.length < 3) return null;
  // `rawOffset` grows a counter-clockwise loop outward; a window runs clockwise
  // so the same code grows it into its own opening.
  if (signedArea(poly) < 0 !== hole) poly = [...poly].reverse();
  const out = untangle(rawOffset(poly, distance)).filter((p) => distanceTo(poly, p) > distance - 1e-3);
  if (out.length < 3) return null;
  // A window narrower than twice the bleed closes up: what remains turns the wrong way or is a sliver.
  if (hole && (signedArea(out) >= 0 || !out.every((p) => insidePolygon(p, poly)))) return null;
  return out;
}

export function bleedOutline(cut: readonly Prim[], distance: number): Prim[] {
  if (!(distance > 0)) return [];
  const loops = closedLoops(cut);
  return loops.flatMap((loop) => {
    const poly = offsetLoop(loop, distance, isHole(loop, loops));
    if (!poly) return [];
    return poly.map((p, i): Prim => ({ kind: "line", a: p, b: poly[(i + 1) % poly.length]! }));
  });
}

const FOLD_TYPES = new Set(["crease", "reverseCrease", "perf", "cutCrease", "halfCut"]);

/**
 * Folds stop at windows: where a fold line runs through a hole (a window cut
 * across a crease), the part inside the opening is removed, so the fold ends
 * on the window's edge either side. Works on any shape, wherever it is moved.
 */
export function trimFoldsAtHoles(paths: Path[]): { paths: Path[]; trimmed: number; removed: Path[] } {
  const loops = closedLoops(paths.filter((p) => p.lineType === "cut"));
  const holes = loops.filter((l) => isHole(l, loops));
  if (!holes.length) return { paths, trimmed: 0, removed: [] };
  let trimmed = 0;
  const removed: Path[] = [];
  // A hole's straight side may run along a fold, a slot set tangent to it: the
  // cut does the fold's job there, and both would be a double knife.
  const onEdge = (p: Pt, a: Pt, b: Pt) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    if (l2 < 1e-12) return false;
    const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2;
    if (t < -1e-9 || t > 1 + 1e-9) return false;
    return Math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1]) < 1e-6;
  };
  const onHoleSide = (p: Pt) => holes.some((h) => h.some((v, i) => onEdge(p, v, h[(i + 1) % h.length]!)));
  const inAnyHole = (p: Pt) => onHoleSide(p) || holes.some((h) => insidePolygon(p, h));

  const out = paths.flatMap((path): Path[] => {
    if (!FOLD_TYPES.has(path.lineType)) return [path];
    if (path.kind !== "line") {
      const pts = flatten(path);
      if (!inAnyHole(pts[Math.floor(pts.length / 2)]!)) return [path];
      for (let i = 1; i < pts.length; i++) trimmed += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
      removed.push(path);
      return [];
    }
    const { a, b } = path;
    const ts = [0, 1];
    for (const h of holes) {
      for (let i = 0; i < h.length; i++) {
        const hit = intersect(a, b, h[i]!, h[(i + 1) % h.length]!);
        if (hit && hit.t > 1e-9 && hit.t < 1 - 1e-9 && hit.u >= -1e-9 && hit.u <= 1 + 1e-9) ts.push(hit.t);
        // A side lying on the fold crosses nothing; its ends split the fold instead.
        const v = h[i]!;
        if (onEdge(v, a, b)) {
          const t = ((v[0] - a[0]) * (b[0] - a[0]) + (v[1] - a[1]) * (b[1] - a[1])) / ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
          if (t > 1e-9 && t < 1 - 1e-9) ts.push(t);
        }
      }
    }
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (ts.length === 2) {
      if (!inAnyHole([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])) return [path];
      trimmed += len;
      removed.push(path);
      return [];
    }
    ts.sort((x, y) => x - y);
    const at = (t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const kept: Path[] = [];
    for (let i = 0; i + 1 < ts.length; i++) {
      const t0 = ts[i]!;
      const t1 = ts[i + 1]!;
      if (t1 - t0 < 1e-9) continue;
      const piece = { ...path, a: at(t0), b: at(t1) };
      if (inAnyHole(at((t0 + t1) / 2))) {
        trimmed += (t1 - t0) * len;
        removed.push(piece);
      } else kept.push(piece);
    }
    return kept;
  });
  return { paths: out, trimmed, removed };
}
