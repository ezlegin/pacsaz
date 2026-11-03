import type { FoldRig } from "./types";

/**
 * When each panel folds during the 0–1 fold animation, and how far.
 *
 * Folding everything at once looks like a box imploding; a person closes a
 * carton in steps, and the order is what keeps panels from passing through
 * each other:
 *
 * 1. The body panels one at a time. The glue flap goes first, so the panel at
 *    the far end of the chain closes onto it last.
 * 2. The bottom flaps, then the top flaps. On each side the dust flaps fold
 *    first, then flaps hinged on flaps (the tuck bends while its lid is still
 *    open), and the lid closes last, carrying the bent tuck into the box.
 *
 * Viewers start closed, so dragging the slider back reverses this: the lid
 * opens, the tuck straightens, the dust flaps open, the bottom, then the sides.
 *
 * Dust flaps under a lid, and the glue flap, fold a little past square, so the
 * lid or the closing panel lands over them instead of into them.
 *
 * Everything is derived from the rig: a *body* panel hinges on a vertical fold
 * line (the creases between the panels of a carton), a *flap* on a horizontal
 * one, and a flap is "top" or "bottom" by which side of its body panel it sits.
 */

export type FoldWindow = {
  start: number;
  end: number;
  /** Fold angle at full closure (radians), when it differs from the node's own. */
  angle?: number;
};

const ALWAYS: FoldWindow = { start: 0, end: 1 };

/** How far past square a dust flap or the glue flap tucks in. */
const TUCK_IN = (6 * Math.PI) / 180;
const SQUARE = Math.PI / 2;

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

  const hasChildren = new Set(nodes.filter((n) => n.parent !== null && !n.isHole).map((n) => n.parent!));
  const width = (i: number) => {
    const xs = nodes[i]!.face.outline.map((p) => p[0]);
    return Math.max(...xs) - Math.min(...xs);
  };

  //! Body panels ------------------------------------------------------------------

  const rootX = nodes[root]!.face.centroid[0];
  const others = [...body].filter((i) => i !== root);
  // The glue flap: a narrow panel at an end of the chain.
  const widths = [...body].map(width).sort((a, b) => a - b);
  const median = widths[Math.floor(widths.length / 2)] ?? 0;
  const glue = others
    .filter((i) => ![...body].some((j) => nodes[j]!.parent === i) && width(i) < median * 0.6)
    .sort((a, b) => width(a) - width(b))[0];
  const glueSide = glue === undefined ? 0 : Math.sign(nodes[glue]!.face.centroid[0] - rootX);

  const panels = others
    .filter((i) => i !== glue)
    .sort((a, b) => {
      const da = nodes[a]!.depth;
      const db = nodes[b]!.depth;
      if (da !== db) return da - db;
      // At equal depth the glue side closes first, so the far end closes onto the glue last.
      const sa = Math.sign(nodes[a]!.face.centroid[0] - rootX) === glueSide ? 0 : 1;
      const sb = Math.sign(nodes[b]!.face.centroid[0] - rootX) === glueSide ? 0 : 1;
      return sa - sb || Math.abs(nodes[a]!.face.centroid[0] - rootX) - Math.abs(nodes[b]!.face.centroid[0] - rootX);
    });

  const stages: string[] = [];
  if (glue !== undefined) stages.push(`panel:${glue}`);
  for (const i of panels) stages.push(`panel:${i}`);

  //! Flaps ------------------------------------------------------------------------

  // Stage of a flap: dust flaps (lone first-level flaps), then deeper flaps from
  // the deepest up, then the lids that carry them.
  const flapStage = (i: number): string => {
    const g = group.get(i)!;
    if (g.level === 1) return `${g.side}:${hasChildren.has(i) ? "lid" : "dust"}`;
    return `${g.side}:level${g.level}`;
  };
  for (const side of ["bottom", "top"] as const) {
    const mine = [...group.entries()].filter(([, g]) => g.side === side);
    const deeper = [...new Set(mine.map(([, g]) => g.level).filter((l) => l > 1))].sort((a, b) => b - a);
    const keys = [`${side}:dust`, ...deeper.map((l) => `${side}:level${l}`), `${side}:lid`];
    for (const key of keys) if (mine.some(([i]) => flapStage(i) === key)) stages.push(key);
  }

  if (stages.length === 0) return nodes.map(() => ALWAYS);

  const step = 1 / stages.length;
  const windowOf = (key: string): FoldWindow => {
    const k = stages.indexOf(key);
    return k < 0 ? ALWAYS : { start: k * step, end: (k + 1) * step };
  };
  const lidOn = new Set(stages.filter((k) => k.endsWith(":lid")).map((k) => k.split(":")[0]));

  return nodes.map((node, i) => {
    if (node.parent === null) return ALWAYS;
    if (body.has(i)) {
      const window = windowOf(`panel:${i}`);
      return i === glue && Math.abs(node.angle - SQUARE) < 1e-6 ? { ...window, angle: node.angle + TUCK_IN } : window;
    }
    const g = group.get(i);
    if (!g) return ALWAYS;
    const window = windowOf(flapStage(i));
    // Only an untouched square fold is deepened; an authored angle is kept.
    const dust = flapStage(i).endsWith(":dust") && lidOn.has(g.side) && Math.abs(node.angle - SQUARE) < 1e-6;
    return dust ? { ...window, angle: node.angle + TUCK_IN } : window;
  });
}

/** How far a panel with this window has folded at overall `progress`, 0–1. */
export function stageProgress(window: FoldWindow, progress: number): number {
  if (progress <= window.start) return 0;
  if (progress >= window.end) return 1;
  return (progress - window.start) / (window.end - window.start);
}
