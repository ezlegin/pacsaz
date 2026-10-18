import M, { IModel, IPoint } from "makerjs";
import Pacsaz from "../pacsaz";

/**
 * Corner fillets.
 *
 * All four radius effects funnel through one routine, `filletWith`, because they
 * only differ in how they choose a radius per corner:
 *
 *   radius          one radius for every corner
 *   radiusAt        one radius for the listed corners
 *   customRadiusAt  an individual radius per corner
 *   fullRadius      the largest radius each corner can take
 *
 * Corner indices follow the order makerjs walks the chain, which is what the
 * editor shows as 0, 1, 2, ... Ã¢â‚¬â€ the same order the old single-radius-at helper
 * used.
 */

interface ChainInfo {
  kpts: IPoint[];
  closed: boolean;
  /** Number of corners (for a closed chain, key points without the duplicate). */
  N: number;
  edgeLength: (index: number) => number;
}

/** Reads the chain of `model` and normalises its corner list. */
function analyze(model: IModel): ChainInfo | null {
  const chain = M.model.findSingleChain(model);
  if (!chain) return null;

  M.chain.reverse(chain);

  let kpts = M.chain.toKeyPoints(chain);
  const closed = isClosedChain(chain);

  if (closed && kpts.length > 1 && ptEq(kpts[0]!, kpts[kpts.length - 1]!)) {
    kpts = kpts.slice(0, -1);
  }

  const N = kpts.length;
  if (N < 3) return null;

  return {
    kpts,
    closed,
    N,
    edgeLength: (index: number) => {
      const a = kpts[index % N]!;
      const b = kpts[(index + 1) % N]!;
      return M.measure.pointDistance(a, b);
    },
  };
}

/**
 * The largest radius corner `i` can take before it starts eating its
 * neighbours: half of the shorter adjacent edge, divided by tan(ÃŽÂ¸/2) so acute
 * corners are allowed a bigger radius and obtuse ones a smaller radius.
 */
function maxRadiusAt(info: ChainInfo, i: number): number {
  const { N, kpts } = info;
  const prev = (i - 1 + N) % N;
  const next = (i + 1) % N;

  const shortest = Math.min(info.edgeLength(prev), info.edgeLength(i));
  if (shortest <= 0) return 0;

  const half = interiorAngle(kpts[prev]!, kpts[i]!, kpts[next]!) / 2;
  const tan = Math.tan(half);

  // A straight (or degenerate) corner has no meaningful limit.
  if (!isFinite(tan) || Math.abs(tan) < 1e-6) return shortest / 2;

  return shortest / 2 / tan;
}

/** Interior angle at `b`, in radians. */
function interiorAngle(a: IPoint, b: IPoint, c: IPoint): number {
  const ux = a[0]! - b[0]!;
  const uy = a[1]! - b[1]!;
  const vx = c[0]! - b[0]!;
  const vy = c[1]! - b[1]!;

  const dot = ux * vx + uy * vy;
  const lenU = Math.hypot(ux, uy);
  const lenV = Math.hypot(vx, vy);

  if (lenU === 0 || lenV === 0) return Math.PI;

  const cosine = Math.min(1, Math.max(-1, dot / (lenU * lenV)));
  return Math.acos(cosine);
}

/** Corners closer together than this are treated as one for neighbour checks. */
const ADJACENT_EPSILON = 1e-6;

/** Applies a per-corner radius map, rebuilding the model's edges around them. */
function filletWith(info: ChainInfo, radii: Map<number, number>): IModel {
  const { kpts, closed, N } = info;

  const lineModel: IModel = { models: {} };
  const filletModel: IModel = { models: {} };

  const edgeCount = closed ? N : N - 1;
  for (let i = 0; i < edgeCount; i++) {
    const j = (i + 1) % N;
    if (radii.has(i) || radii.has(j)) continue;
    const seg = new M.models.ConnectTheDots(false, [kpts[i]!, kpts[j]!]);
    Pacsaz.shape.push(lineModel, `line-${i}-${j}`, seg);
  }

  for (const i of Array.from(radii.keys()).sort((a, b) => a - b)) {
    const radius = radii.get(i)!;
    if (radius <= 0) continue;

    const prev = (i - 1 + N) % N;
    const next = (i + 1) % N;

    let pBefore = kpts[prev]!;
    let pAfter = kpts[next]!;

    // When the neighbouring corner is also rounded, meet it at the midpoint of
    // the shared edge instead of at the neighbour's own corner.
    if (radii.has(prev)) {
      pBefore = M.point.middle(new M.paths.Line(kpts[prev]!, kpts[i]!));
    }
    if (radii.has(next)) {
      pAfter = M.point.middle(new M.paths.Line(kpts[i]!, kpts[next]!));
    }

    // Skip a corner whose neighbours collapsed onto it.
    if (ptEq(pBefore, kpts[i]!) && ptEq(pAfter, kpts[i]!)) continue;

    const sub = new M.models.ConnectTheDots(false, [pBefore, kpts[i]!, pAfter]);
    const subChain = M.model.findSingleChain(sub);
    if (!subChain) continue;

    const fillet = retryFillet(subChain, radius);
    if (fillet) {
      Pacsaz.shape.push(filletModel, `fillet-${i}`, {
        models: { fillet, sub },
      });
    }
  }

  return {
    models: {
      lineModel,
      filletModel,
    },
  };
}

/** Round every corner with one radius. */
export function addFillet(model: IModel, radius: number = 0): IModel {
  if (radius <= 0) return model;

  const info = analyze(model);
  if (!info) return model;

  const radii = new Map<number, number>();
  for (let i = 0; i < info.N; i++) radii.set(i, radius);

  return filletWith(info, radii);
}

/** Round only the listed corners, all with the same radius. */
export function addFilletAt(
  model: IModel,
  indices: number[],
  radius: number = 0,
): IModel {
  if (radius <= 0 || indices.length === 0) return model;

  const info = analyze(model);
  if (!info) return model;

  const radii = new Map<number, number>();
  for (const i of indices) {
    if (i >= 0 && i < info.N) radii.set(i, radius);
  }
  if (radii.size === 0) return model;

  return filletWith(info, radii);
}

/** Round individual corners with their own radii. */
export function addCustomFilletAt(
  model: IModel,
  entries: { index: number; radius: number }[],
): IModel {
  const info = analyze(model);
  if (!info) return model;

  const radii = new Map<number, number>();
  for (const { index, radius } of entries) {
    if (!Number.isFinite(index) || !Number.isFinite(radius)) continue;
    if (index < 0 || index >= info.N || radius <= 0) continue;
    radii.set(index, radius);
  }
  if (radii.size === 0) return model;

  return filletWith(info, radii);
}

/**
 * Round every corner by the largest amount it allows. A rectangle becomes a
 * perfect capsule instead of the partial "leaf" a very large `radius` produces.
 */
export function addFullFillet(model: IModel): IModel {
  const info = analyze(model);
  if (!info) return model;

  const radii = new Map<number, number>();
  for (let i = 0; i < info.N; i++) {
    const r = maxRadiusAt(info, i);
    if (r > 0) radii.set(i, r);
  }
  if (radii.size === 0) return model;

  return filletWith(info, radii);
}

/** Largest radius each corner allows, for callers that want to preview it. */
export function fullRadiiFor(model: IModel): number[] {
  const info = analyze(model);
  if (!info) return [];

  const out: number[] = [];
  for (let i = 0; i < info.N; i++) out.push(maxRadiusAt(info, i));
  return out;
}

/**
 * Applies a fillet, stepping the radius down until makerjs accepts it.
 *
 * The radius is passed through unchanged: model coordinates are already the
 * dieline's millimetres, so converting them (the old `toMm`) shrank every fillet
 * to ~35% of the requested size â€” which is why a "full" radius only looked
 * partially rounded.
 */
function retryFillet(chain: M.IChain, radius: number): IModel | null {
  const step = Math.max(0.05, radius / 50);
  for (let r = radius; r > 0.05; r -= step) {
    const f = M.chain.fillet(chain, r);
    if (f) return f;
  }
  return null;
}

function isClosedChain(chain: M.IChain): boolean {
  return (chain as any).endless === true;
}

function ptEq(a: M.IPoint, b: M.IPoint): boolean {
  return (
    Math.abs(a[0]! - b[0]!) < ADJACENT_EPSILON &&
    Math.abs(a[1]! - b[1]!) < ADJACENT_EPSILON
  );
}


