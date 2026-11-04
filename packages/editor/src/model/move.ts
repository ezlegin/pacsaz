import {
  findNode,
  formatNumber,
  offsetExpr,
  placePoint,
  refExpr,
  updateNode,
  type DielineDocument,
  type Pt,
  type RenderResult,
  type Transform,
} from "@repo/dieline-engine";
import { axisAligned, chainOffset, parentChain, topLevel, worldToLocalVector } from "./frames";
import { wouldCycle, type SnapResult } from "./snap";

export type MoveOptions = {
  /** Alt: write plain numbers instead of adjusting the formula. */
  plain?: boolean;
  /** Axis snaps found for this movement; a single moved node turns them into references. */
  snap?: SnapResult;
};

/**
 * Moves nodes by a world-space delta by editing their transforms.
 *
 * - By default the trailing constant of `transform.x`/`y` changes, so the formula
 *   keeps following its variables (`width + 12` → `width + 15`).
 * - When one node is moved and an axis snapped to another node's anchor, that
 *   axis becomes a reference (`@side.right.x`), so the two stay together when
 *   the dimensions change. Skipped when it would create a loop or the node sits
 *   in a rotated or mirrored group.
 * - With `plain`, the evaluated position is written as a number.
 *
 * `result` must be the render of `doc` (the state the gesture started from).
 */
export function moveNodes(
  doc: DielineDocument,
  result: RenderResult,
  ids: string[],
  delta: Pt,
  options: MoveOptions = {},
): DielineDocument {
  const roots = topLevel(result, ids);
  let next = doc;

  for (const id of roots) {
    const info = result.nodes[id];
    const located = findNode(doc, id);
    if (!info || !located) continue;

    const parents = parentChain(result, id);
    const local = worldToLocalVector(delta, parents);
    const t: Transform = located.node.transform ?? {};
    // The node's reference point, which is what its transform positions.
    const position = placePoint(info.origin, info.placement);

    const axis = (key: "x" | "y", i: 0 | 1): string | undefined => {
      const current = t[key];
      const moved = local[i];
      const snap = options.snap?.[key];

      // References give world coordinates, so they are only written where the
      // parent frame is the world frame; inside a moved group a reference would
      // drift whenever the group moves.
      const worldFrame = axisAligned(parents) && chainOffset(parents)[i] === 0;

      // Only the node's own origin landing on the target becomes a reference.
      // Snapping some other point (a far edge) would need a constant like
      // `- 320` that is just today's size frozen in, and would drift as soon as
      // the dimensions change; those snaps still align exactly, but keep the
      // formula and adjust its constant instead.
      const newOrigin = position[i] + moved;
      const linked = snap && Math.abs(newOrigin - snap.target.point[i]) < 1e-6;

      if (snap && linked && roots.length === 1 && !options.plain && worldFrame && !wouldCycle(doc, result, id, snap.target.nodeId)) {
        return refExpr(snap.target.nodeName, snap.target.anchor, key);
      }

      if (Math.abs(moved) < 1e-9) return current;
      if (options.plain) return formatNumber(position[i] + moved);
      return offsetExpr(current ?? "0", moved);
    };

    const x = axis("x", 0);
    const y = axis("y", 1);
    if (x === t.x && y === t.y) continue;

    next = updateNode(next, id, (n) => ({
      ...n,
      transform: { ...t, ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}) },
    }));
  }

  return next;
}
