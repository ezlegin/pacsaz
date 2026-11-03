import { placePoint, type NodeInfo, type Placement, type Pt, type RenderResult } from "@repo/dieline-engine";

/**
 * Coordinate frames. A node's geometry lives in its local frame; its placement
 * moves it into its parent's frame, and each group's placement moves it further
 * out until world space. A chain lists placements innermost first.
 */

export function parentChain(result: RenderResult, id: string): Placement[] {
  const chain: Placement[] = [];
  for (let p = result.nodes[id]?.parentId ?? null; p; p = result.nodes[p]?.parentId ?? null) {
    const info = result.nodes[p];
    if (info) chain.push(info.placement);
  }
  return chain;
}

export function fullChain(result: RenderResult, id: string): Placement[] {
  const own = result.nodes[id]?.placement;
  return own ? [own, ...parentChain(result, id)] : parentChain(result, id);
}

export function toWorld(p: Pt, chain: Placement[]): Pt {
  return chain.reduce((point, placement) => placePoint(point, placement), p);
}

/** Applies only the rotation and mirroring of a placement to a direction. */
export function linear(v: Pt, t: Placement): Pt {
  return placePoint(v, { ...t, x: 0, y: 0 });
}

/** Undoes the rotation and mirroring of a placement on a direction. */
function inverseLinear(v: Pt, t: Placement): Pt {
  const rad = (-t.rotate * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let x = v[0] * cos - v[1] * sin;
  let y = v[0] * sin + v[1] * cos;
  if (t.mirrorX) x = -x;
  if (t.mirrorY) y = -y;
  return [x, y];
}

/** A world point expressed in the frame at the inner end of `chain`. */
export function worldToLocalPoint(p: Pt, chain: Placement[]): Pt {
  return [...chain].reverse().reduce<Pt>((point, t) => inverseLinear([point[0] - t.x, point[1] - t.y], t), p);
}

/** A world-space movement expressed in the frame at the inner end of `chain`. */
export function worldToLocalVector(v: Pt, chain: Placement[]): Pt {
  // Undo the outermost placement first.
  return [...chain].reverse().reduce((vec, t) => inverseLinear(vec, t), v);
}

/** True when the chain only translates, so world and local axes line up. */
export function axisAligned(chain: Placement[]): boolean {
  return chain.every((t) => !t.rotate && !t.mirrorX && !t.mirrorY);
}

/** Total translation of an axis-aligned chain. */
export function chainOffset(chain: Placement[]): Pt {
  return chain.reduce<Pt>((acc, t) => [acc[0] + t.x, acc[1] + t.y], [0, 0]);
}

//! Picking --------------------------------------------------------------------

/** Ids from `id` up to the root, `id` first. */
export function lineage(result: RenderResult, id: string): string[] {
  const out: string[] = [];
  for (let cur: string | null = id; cur; cur = result.nodes[cur]?.parentId ?? null) out.push(cur);
  return out;
}

/**
 * What a click on a piece of geometry selects: the ancestor that is a direct
 * child of the entered group (or a root node when no group is entered). Null
 * when the geometry lies outside the entered group.
 */
export function pickable(result: RenderResult, leafId: string, scope: string | null): string | null {
  const ids = lineage(result, leafId);
  if (scope === null) return ids[ids.length - 1] ?? null;
  const at = ids.indexOf(scope);
  return at > 0 ? ids[at - 1]! : null;
}

export function isInside(result: RenderResult, id: string, ancestor: string): boolean {
  return lineage(result, id).slice(1).includes(ancestor);
}

/** Drops ids whose ancestor is also in the list, so a move is applied once. */
export function topLevel(result: RenderResult, ids: string[]): string[] {
  const set = new Set(ids);
  return ids.filter((id) => !lineage(result, id).slice(1).some((a) => set.has(a)));
}

export function selectionBounds(result: RenderResult, ids: string[]) {
  let b: NonNullable<NodeInfo["bounds"]> | null = null;
  for (const id of ids) {
    const nb = result.nodes[id]?.bounds;
    if (!nb) continue;
    b = b
      ? {
          minX: Math.min(b.minX, nb.minX),
          minY: Math.min(b.minY, nb.minY),
          maxX: Math.max(b.maxX, nb.maxX),
          maxY: Math.max(b.maxY, nb.maxY),
        }
      : { ...nb };
  }
  return b;
}
