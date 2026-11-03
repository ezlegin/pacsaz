import type { FoldRig } from "./types";

/**
 * When each panel folds during the 0–1 fold animation.
 *
 * Folding everything at once looks like a box imploding; a person closes a
 * carton in steps. So the fold runs in stages: the body panels one at a time,
 * working outward from the root panel (the glue flap last), then the flaps
 * along the bottom edge, and finally the flaps along the top edge, each split
 * again for flaps hinged on flaps (a lid before its tuck). The viewer starts
 * closed, so dragging the slider back opens the top first, then the bottom,
 * then unwraps the sides.
 *
 * Everything is derived from the rig: a *body* panel hinges on a vertical fold
 * line (the creases between the panels of a carton), a *flap* on a horizontal
 * one, and a flap is "top" or "bottom" by which side of its body panel it sits.
 */

export type FoldWindow = { start: number; end: number };

const ALWAYS: FoldWindow = { start: 0, end: 1 };

export function foldSchedule(rig: FoldRig): FoldWindow[] {
  const nodes = rig.nodes;
  const root = nodes.findIndex((n) => n.parent === null);
  if (root < 0) return nodes.map(() => ALWAYS);

  const vertical = (i: number) => {
    const a = nodes[i]!.axis;
    return Math.abs(a[1]) > Math.abs(a[0]);
  };

  // Resolve parents before children: depth order.
  const order = nodes.map((_, i) => i).filter((i) => nodes[i]!.depth >= 0).sort((a, b) => nodes[a]!.depth - nodes[b]!.depth);

  const body = new Set<number>([root]);
  const group = new Map<number, { side: "top" | "bottom"; level: number }>();

  for (const i of order) {
    const node = nodes[i]!;
    if (node.parent === null || node.isHole) continue;
    const parent = node.parent;
    if (body.has(parent) && vertical(i)) {
      body.add(i);
      continue;
    }
    const inherited = group.get(parent);
    if (inherited) {
      group.set(i, { side: inherited.side, level: inherited.level + 1 });
    } else {
      // SVG coordinates: smaller y is higher on the sheet.
      const above = node.face.centroid[1] < nodes[parent]!.face.centroid[1];
      group.set(i, { side: above ? "top" : "bottom", level: 1 });
    }
  }

  // Stage keys in folding order.
  const stages: string[] = [];
  const rootX = nodes[root]!.face.centroid[0];
  const panels = [...body]
    .filter((i) => i !== root)
    .sort((a, b) => nodes[a]!.depth - nodes[b]!.depth || Math.abs(nodes[a]!.face.centroid[0] - rootX) - Math.abs(nodes[b]!.face.centroid[0] - rootX));
  for (const i of panels) stages.push(`panel:${i}`);
  for (const side of ["bottom", "top"] as const) {
    const levels = [...new Set([...group.values()].filter((g) => g.side === side).map((g) => g.level))].sort((a, b) => a - b);
    for (const level of levels) stages.push(`${side}:${level}`);
  }

  if (stages.length === 0) return nodes.map(() => ALWAYS);

  const step = 1 / stages.length;
  const windowOf = (key: string): FoldWindow => {
    const k = stages.indexOf(key);
    return k < 0 ? ALWAYS : { start: k * step, end: (k + 1) * step };
  };

  return nodes.map((node, i) => {
    if (node.parent === null) return ALWAYS;
    if (body.has(i)) return windowOf(`panel:${i}`);
    const g = group.get(i);
    return g ? windowOf(`${g.side}:${g.level}`) : ALWAYS;
  });
}

/** How far a panel with this window has folded at overall `progress`, 0–1. */
export function stageProgress(window: FoldWindow, progress: number): number {
  if (progress <= window.start) return 0;
  if (progress >= window.end) return 1;
  return (progress - window.start) / (window.end - window.start);
}
