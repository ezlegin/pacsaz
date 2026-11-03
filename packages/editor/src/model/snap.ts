import { allNodes, mapExprs, referencedNodes, type DielineDocument, type Pt, type RenderResult } from "@repo/dieline-engine";
import { lineage } from "./frames";

/** A point other geometry can snap to: a named anchor of a visible node. */
export type SnapTarget = { nodeId: string; nodeName: string; anchor: string; point: Pt };

export type AxisSnap = {
  /** World coordinate on this axis that was snapped to. */
  value: number;
  target: SnapTarget;
  /** The moving point that snapped. */
  from: Pt;
};

export type SnapResult = { x?: AxisSnap; y?: AxisSnap };

/**
 * Anchors of every visible node except `exclude` and anything inside it.
 * Box anchors and shape points (path vertices, line ends) all qualify.
 */
export function snapTargets(result: RenderResult, exclude: readonly string[]): SnapTarget[] {
  const skip = new Set(exclude);
  const out: SnapTarget[] = [];

  for (const info of Object.values(result.nodes)) {
    if (!info.visible || info.failed) continue;
    if (lineage(result, info.id).some((id) => skip.has(id))) continue;
    // A group's corners duplicate its children's; children are more precise.
    if (info.kind === "group") continue;

    for (const [anchor, point] of Object.entries(info.anchors)) {
      out.push({ nodeId: info.id, nodeName: info.name, anchor, point });
    }
  }

  return out;
}

/**
 * Finds the closest alignment per axis between any moving point and any target,
 * within `tolerance` (world mm). Axes snap independently, which gives the
 * familiar "align left edges" guides; when both snap to the same target it is a
 * point snap.
 */
export function snapMoving(moving: Pt[], targets: SnapTarget[], tolerance: number): SnapResult {
  let bestX: (AxisSnap & { d: number }) | null = null;
  let bestY: (AxisSnap & { d: number }) | null = null;

  for (const m of moving) {
    for (const t of targets) {
      const dx = Math.abs(t.point[0] - m[0]);
      if (dx <= tolerance && (!bestX || dx < bestX.d)) bestX = { value: t.point[0], target: t, from: m, d: dx };
      const dy = Math.abs(t.point[1] - m[1]);
      if (dy <= tolerance && (!bestY || dy < bestY.d)) bestY = { value: t.point[1], target: t, from: m, d: dy };
    }
  }

  // Prefer a full point snap when one target is close on both axes. Ties go to
  // the point snap: dielines are full of coinciding corners, and two axis snaps
  // to different nodes at the same spot cannot become one reference.
  let bestPoint = Infinity;
  const axisBest = bestX && bestY ? Math.hypot(bestX.d, bestY.d) : Infinity;
  for (const m of moving) {
    for (const t of targets) {
      const d = Math.hypot(t.point[0] - m[0], t.point[1] - m[1]);
      if (d <= tolerance && d < bestPoint && d <= axisBest + 1e-9) {
        bestPoint = d;
        bestX = { value: t.point[0], target: t, from: m, d: Math.abs(t.point[0] - m[0]) };
        bestY = { value: t.point[1], target: t, from: m, d: Math.abs(t.point[1] - m[1]) };
      }
    }
  }

  const strip = (s: (AxisSnap & { d: number }) | null): AxisSnap | undefined =>
    s ? { value: s.value, target: s.target, from: s.from } : undefined;

  return { x: strip(bestX), y: strip(bestY) };
}

/**
 * The movement after snapping. `snap` was found for points already moved by
 * `delta`; snapped axes get the extra correction that lands them exactly, the
 * others are rounded to `step` so free movement gives tidy numbers.
 */
export function snappedDelta(delta: Pt, snap: SnapResult, step: number): Pt {
  return [
    snap.x ? delta[0] + snap.x.value - snap.x.from[0] : quantize(delta[0], step),
    snap.y ? delta[1] + snap.y.value - snap.y.from[1] : quantize(delta[1], step),
  ];
}

/**
 * A "nice" step for unsnapped movement at this zoom, so dragging produces 12.5
 * rather than 12.4873. About 4 screen pixels, rounded to 1/2/5 × 10ⁿ mm.
 */
export function niceStep(zoom: number): number {
  const raw = 4 / zoom;
  const power = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) if (m * power >= raw) return m * power;
  return 10 * power;
}

export const quantize = (value: number, step: number) => Math.round(value / step) * step;

//! Reference safety -----------------------------------------------------------

/**
 * Whether writing a reference to `targetId` into `nodeId` would create a loop.
 *
 * Dependencies are tracked per facet, the way the engine builds nodes:
 *   world(X)     = geometry(X) + placement of each ancestor of X
 *   geometry(X)  = placement(X) + what X's shape expressions reference
 *                  + geometry of X's children
 *   placement(X) = what X's transform references
 * so siblings in a group may reference each other freely. `editing` says which
 * facet of the node the new reference goes into: its transform (a move) or its
 * shape (a handle drag).
 */
export function wouldCycle(
  doc: DielineDocument,
  result: RenderResult,
  nodeId: string,
  targetId: string,
  editing: "placement" | "geometry" = "placement",
): boolean {
  const nodes = allNodes(doc);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const idByName = new Map(nodes.map((n) => [n.name, n.id]));

  const refsOf = (value: unknown): string[] => {
    const ids: string[] = [];
    mapExprs(value, (expr) => {
      for (const name of referencedNodes(expr)) {
        const id = idByName.get(name);
        if (id) ids.push(id);
      }
      return expr;
    });
    return ids;
  };

  const edges = (key: string): string[] => {
    const [facet, id] = [key[0], key.slice(2)];
    const node = byId.get(id);
    if (!node) return [];

    if (facet === "w") {
      return [`g:${id}`, ...lineage(result, id).slice(1).map((a) => `p:${a}`)];
    }
    if (facet === "p") return refsOf(node.transform ?? {}).map((r) => `w:${r}`);

    // Geometry: everything except the transform and the children.
    const own = { ...node, transform: undefined, ...(node.kind === "group" ? { children: [] } : {}) };
    return [
      `p:${id}`,
      ...refsOf(own).map((r) => `w:${r}`),
      ...(node.kind === "group" ? node.children.map((c) => `g:${c.id}`) : []),
    ];
  };

  const goal = `${editing === "placement" ? "p" : "g"}:${nodeId}`;
  const seen = new Set<string>();
  const stack = [`w:${targetId}`];

  while (stack.length) {
    const key = stack.pop()!;
    if (key === goal) return true;
    if (seen.has(key)) continue;
    seen.add(key);
    stack.push(...edges(key));
  }
  return false;
}
