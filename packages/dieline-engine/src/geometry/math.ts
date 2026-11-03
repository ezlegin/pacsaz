import { EPSILON, type Bounds, type Path, type Prim, type Pt } from "./types";

const RAD = Math.PI / 180;

export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
export const scale = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
export const length = (a: Pt): number => Math.hypot(a[0], a[1]);
export const distance = (a: Pt, b: Pt): number => length(sub(a, b));
export const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export function unit(a: Pt): Pt {
  const len = length(a);
  return len < EPSILON ? [0, 0] : [a[0] / len, a[1] / len];
}

export const samePoint = (a: Pt, b: Pt, tolerance = 1e-4): boolean =>
  Math.abs(a[0] - b[0]) < tolerance && Math.abs(a[1] - b[1]) < tolerance;

/**
 * Cosine and sine of an angle in degrees, exact at multiples of 90°. Dielines are
 * full of right angles, and `Math.cos(π/2)` being 6e-17 instead of 0 would leak
 * into bounds and anchors.
 */
export function cosSin(angleDeg: number): [number, number] {
  const a = norm(angleDeg);
  if (a === 0) return [1, 0];
  if (a === 90) return [0, 1];
  if (a === 180) return [-1, 0];
  if (a === 270) return [0, -1];
  return [Math.cos(a * RAD), Math.sin(a * RAD)];
}

export const polar = (angleDeg: number, r: number, c: Pt = [0, 0]): Pt => {
  const [cos, sin] = cosSin(angleDeg);
  return [c[0] + r * cos, c[1] + r * sin];
};

export const angleOf = (v: Pt): number => Math.atan2(v[1], v[0]) / RAD;

/** Normalises an angle into [0, 360). */
export function norm(angle: number): number {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

/** Counter-clockwise sweep from `start` to `end`, in (0, 360]. */
export function sweep(start: number, end: number): number {
  const s = norm(end - start);
  return s < EPSILON ? 360 : s;
}

//! Endpoints ---------------------------------------------------------------------

export function endpoints(prim: Prim): [Pt, Pt] | null {
  switch (prim.kind) {
    case "line":
      return [prim.a, prim.b];
    case "arc":
      return [polar(prim.start, prim.r, prim.c), polar(prim.end, prim.r, prim.c)];
    case "circle":
      return null;
  }
}

//! Transforms ----------------------------------------------------------------------

/**
 * A placement in the fixed order mirror → rotate (about the origin) → translate.
 * Kept as data rather than a matrix so arcs stay exact and mirroring can flip
 * their direction.
 */
export type Placement = {
  x: number;
  y: number;
  rotate: number;
  mirrorX: boolean;
  mirrorY: boolean;
};

export const IDENTITY: Placement = {
  x: 0,
  y: 0,
  rotate: 0,
  mirrorX: false,
  mirrorY: false,
};

export function isIdentity(p: Placement): boolean {
  return !p.x && !p.y && !p.rotate && !p.mirrorX && !p.mirrorY;
}

export function placePoint(p: Pt, t: Placement): Pt {
  let x = t.mirrorX ? -p[0] : p[0];
  let y = t.mirrorY ? -p[1] : p[1];

  if (t.rotate) {
    const [cos, sin] = cosSin(t.rotate);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];
  }

  return [x + t.x, y + t.y];
}

/** Mirroring reverses an arc's direction, so its start and end swap roles. */
function placeAngles(start: number, end: number, t: Placement): [number, number] {
  let s = start;
  let e = end;

  if (t.mirrorX) [s, e] = [180 - e, 180 - s];
  if (t.mirrorY) [s, e] = [-e, -s];

  return [norm(s + t.rotate), norm(e + t.rotate)];
}

export function placePrim<T extends Prim>(prim: T, t: Placement): T {
  if (isIdentity(t)) return prim;

  switch (prim.kind) {
    case "line":
      return { ...prim, a: placePoint(prim.a, t), b: placePoint(prim.b, t) };
    case "circle":
      return { ...prim, c: placePoint(prim.c, t) };
    case "arc": {
      const [start, end] = placeAngles(prim.start, prim.end, t);
      return { ...prim, c: placePoint(prim.c, t), start, end };
    }
  }
}

export function placePaths(paths: Path[], t: Placement): Path[] {
  return isIdentity(t) ? paths : paths.map((p) => placePrim(p, t));
}

//! Bounds --------------------------------------------------------------------------

export function emptyBounds(): Bounds {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

export function isEmpty(b: Bounds): boolean {
  return b.minX > b.maxX;
}

function grow(b: Bounds, p: Pt) {
  if (p[0] < b.minX) b.minX = p[0];
  if (p[1] < b.minY) b.minY = p[1];
  if (p[0] > b.maxX) b.maxX = p[0];
  if (p[1] > b.maxY) b.maxY = p[1];
}

/** Whether the counter-clockwise arc from `start` to `end` passes `angle`. */
function arcContains(start: number, end: number, angle: number): boolean {
  return norm(angle - start) <= sweep(start, end) + EPSILON;
}

export function primBounds(prim: Prim, into: Bounds = emptyBounds()): Bounds {
  switch (prim.kind) {
    case "line":
      grow(into, prim.a);
      grow(into, prim.b);
      break;
    case "circle":
      grow(into, [prim.c[0] - prim.r, prim.c[1] - prim.r]);
      grow(into, [prim.c[0] + prim.r, prim.c[1] + prim.r]);
      break;
    case "arc":
      grow(into, polar(prim.start, prim.r, prim.c));
      grow(into, polar(prim.end, prim.r, prim.c));
      for (const quadrant of [0, 90, 180, 270]) {
        if (arcContains(prim.start, prim.end, quadrant)) {
          grow(into, polar(quadrant, prim.r, prim.c));
        }
      }
      break;
  }
  return into;
}

export function pathsBounds(paths: readonly Prim[]): Bounds | null {
  const b = emptyBounds();
  for (const p of paths) primBounds(p, b);
  return isEmpty(b) ? null : b;
}

export function unionBounds(a: Bounds | null, b: Bounds | null): Bounds | null {
  if (!a) return b;
  if (!b) return a;
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

//! Lengths -----------------------------------------------------------------------

export function primLength(prim: Prim): number {
  switch (prim.kind) {
    case "line":
      return distance(prim.a, prim.b);
    case "circle":
      return 2 * Math.PI * prim.r;
    case "arc":
      return (sweep(prim.start, prim.end) / 360) * 2 * Math.PI * prim.r;
  }
}
