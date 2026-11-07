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

/** Narrowest a gap may be before the bleed bridges it: at least 10 mm, three bleeds on a wide bleed. */
export const bridgeGap = (distance: number) => Math.max(10, 3 * distance);

/** Distance from `p` to the segment `a`–`b`, and the closest point on it. */
function closest(p: Pt, a: Pt, b: Pt): { d: number; q: Pt } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  const q: Pt = [a[0] + t * dx, a[1] + t * dy];
  return { d: Math.hypot(p[0] - q[0], p[1] - q[1]), q };
}

/**
 * Closes every narrow notch of a part's outline (a slot, a gap between flaps)
 * across its mouth, so the bleed runs straight over it. Offsetting into a gap
 * about twice the bleed wide leaves a hairline or a sliver of print down the
 * middle of it, which no press can hold; the notch is waste, so printing
 * over it costs nothing.
 *
 * A bridge joins a corner to the nearest point on another edge, no further than
 * `gap`, through open air (it crosses no edge and its middle lies outside the
 * part), cutting off a notch deeper than half the bleed that is the smaller side of
 * the loop. The widest notch at a spot wins, so a slot closes at its mouth.
 */
function bridgeNotches(poly: Pt[], gap: number, depth: number): Pt[] {
  const n = poly.length;
  // A notch half the bleed deep or more is bridged too: offset, its sides would
  // meet in a sharp inward V in the bleed (beside a handle's ear, say).
  const minDepth = depth / 2;
  const total = Math.abs(signedArea(poly));
  type Bridge = { i: number; k: number; q: Pt; area: number; forward: boolean };
  const found: Bridge[] = [];
  const crossesEdge = (a: Pt, b: Pt) =>
    poly.some((v, e) => {
      const hit = intersect(a, b, v, poly[(e + 1) % n]!);
      return !!hit && hit.t > 1e-6 && hit.t < 1 - 1e-6 && hit.u > 1e-6 && hit.u < 1 - 1e-6;
    });

  // Running sums along the loop, so a notch's length and area cost nothing:
  // `along` is the distance to each vertex, `cross` the shoelace sum up to it.
  const along = [0];
  const cross = [0];
  for (let s = 1; s <= n; s++) {
    const a = poly[s - 1]!;
    const b = poly[s % n]!;
    along.push(along[s - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
    cross.push(cross[s - 1]! + a[0] * b[1] - b[0] * a[1]);
  }
  const perimeter = along[n]!;
  const loopCross = cross[n]!;
  /** Length and shoelace sum walking forward from vertex `from` to vertex `to`. */
  const run = (from: number, to: number) =>
    to >= from
      ? { len: along[to]! - along[from]!, cross: cross[to]! - cross[from]! }
      : { len: perimeter - along[from]! + along[to]!, cross: loopCross - cross[from]! + cross[to]! };
  const wedge = (a: Pt, b: Pt) => a[0] * b[1] - b[0] * a[1];

  for (let i = 0; i < n; i++) {
    const p = poly[i]!;
    for (let k = 0; k < n; k++) {
      // Not the vertex's own edges, nor the ones right beside them.
      const dk = (k - i + n) % n;
      if (dk <= 1 || dk >= n - 2) continue;
      const a = poly[k]!;
      const b = poly[(k + 1) % n]!;
      const { d, q } = closest(p, a, b);
      if (d > gap || d < 1e-6) continue;
      // A notch deeper than the bleed runs at least its width plus twice the bleed.
      const need = d + 2 * minDepth;
      // The notch runs forward from i to the segment k, or backward from i to k + 1.
      for (const forward of [true, false]) {
        const r = forward ? run(i, k) : run((k + 1) % n, i);
        const end = forward ? a : b;
        const len = r.len + Math.hypot(q[0] - end[0], q[1] - end[1]);
        if (len < need) continue;
        // Closed by the bridge: i … k → q → i forward, q → k + 1 … i → q backward.
        const area = Math.abs(forward ? r.cross + wedge(a, q) + wedge(q, p) : wedge(q, b) + r.cross + wedge(p, q)) / 2;
        if (area >= total / 2) continue;
        const mid: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        if (insidePolygon(mid, poly) || distanceTo(poly, mid) < 1e-6 || crossesEdge(p, q)) continue;
        let reach = 0;
        for (let s = i; s !== (forward ? (k + 1) % n : k); s = forward ? (s + 1) % n : (s - 1 + n) % n) {
          reach = Math.max(reach, closest(poly[s]!, p, q).d);
          if (reach > minDepth) break;
        }
        if (reach <= minDepth) continue;
        found.push({ i, k, q, area, forward });
      }
    }
  }
  if (!found.length) return poly;

  // Apply the widest notches first; a notch inside one already closed is skipped.
  found.sort((a, b) => b.area - a.area);
  const gone = new Set<number>();
  const cuts: { from: number; to: number; q: Pt; forward: boolean }[] = [];
  for (const b of found) {
    const span: number[] = [];
    if (b.forward) for (let s = (b.i + 1) % n; s !== (b.k + 1) % n; s = (s + 1) % n) span.push(s);
    else for (let s = (b.i - 1 + n) % n; s !== b.k; s = (s - 1 + n) % n) span.push(s);
    if (gone.has(b.i) || span.some((s) => gone.has(s))) continue;
    for (const s of span) gone.add(s);
    cuts.push({ from: b.i, to: b.forward ? b.k : (b.k + 1) % n, q: b.q, forward: b.forward });
  }
  // Walk the loop, dropping each notch's vertices and putting its bridge end in their place.
  const insertAfter = new Map<number, Pt>();
  for (const c of cuts) {
    if (c.forward) insertAfter.set(c.from, c.q);
    else insertAfter.set(c.to, c.q);
  }
  const out: Pt[] = [];
  for (let s = 0; s < n; s++) {
    if (!gone.has(s)) out.push(poly[s]!);
    const extra = insertAfter.get(s);
    if (extra && !gone.has(s)) out.push(extra);
  }
  return tightenBridges(cleaned(out), poly, depth, gap);
}

/**
 * A bridge joins a corner to the nearest point across the notch, which on a
 * curve (a handle's round ear beside a V) is part way down it: the bleed would
 * dip into a kink there; on a straight edge it lands part way along it, and
 * the bleed folds into the corner it leaves. Each end of a bridge slides on
 * over inward corners no deeper than the bridge is long (or the bleed, at
 * least; never past `gap`), so it leaves a curve on its tangent and runs on to
 * the next outer corner, as a knife-maker draws it. Edges of `original` are not bridges.
 */
function tightenBridges(poly: Pt[], original: Pt[], depth: number, gap: number): Pt[] {
  const edge = (a: Pt, b: Pt) => `${key(a)}|${key(b)}`;
  const edges = new Set(original.map((p, i) => edge(p, original[(i + 1) % original.length]!)));
  const isBridge = (a: Pt, b: Pt) => !edges.has(edge(a, b));
  const crossesEdge = (q: Pt[], a: Pt, b: Pt) =>
    q.some((v, e) => {
      const hit = intersect(a, b, v, q[(e + 1) % q.length]!);
      return !!hit && hit.t > 1e-6 && hit.t < 1 - 1e-6 && hit.u > 1e-6 && hit.u < 1 - 1e-6;
    });
  // Inward (clockwise on a counter-clockwise loop) and no deeper than the bridge
  // across it is long: dropping it only prints over the notch's own waste.
  const shallowDip = (u: Pt, p: Pt, w: Pt, bridge: number) =>
    (p[0] - u[0]) * (w[1] - p[1]) - (p[1] - u[1]) * (w[0] - p[0]) < -1e-9 &&
    closest(p, u, w).d <= Math.min(gap, Math.max(depth, bridge));

  let q = poly;
  for (let pass = 0; pass < 1000; pass++) {
    const n = q.length;
    if (n < 4) return q;
    let drop = -1;
    for (let j = 0; j < n && drop < 0; j++) {
      const a = q[j]!;
      const b = q[(j + 1) % n]!;
      if (!isBridge(a, b)) continue;
      const before = q[(j - 1 + n) % n]!;
      const after = q[(j + 2) % n]!;
      const bridge = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (shallowDip(before, a, b, bridge) && !crossesEdge(q, before, b)) drop = j;
      else if (shallowDip(a, b, after, bridge) && !crossesEdge(q, a, after)) drop = (j + 1) % n;
    }
    if (drop < 0) return q;
    // The new segment joins two points that were not neighbours: it is a bridge too.
    const u = q[(drop - 1 + n) % n]!;
    const w = q[(drop + 1) % n]!;
    edges.delete(edge(u, w));
    q = q.filter((_, i) => i !== drop);
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
  // Only a part's outline: a window's narrow neck is part of the window.
  if (!hole) poly = bridgeNotches(poly, bridgeGap(distance), distance);
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
