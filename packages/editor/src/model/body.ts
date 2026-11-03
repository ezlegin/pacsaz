import type { EdgeFeature, PanelsNode, Pt, RenderResult } from "@repo/dieline-engine";
import { fullChain, linear } from "./frames";

/** One edge of a box body where a feature can go. */
export type EdgeSlot = {
  /** Path of the feature in the node (`panels.2.top`, `left`). */
  path: string;
  label: string;
  /** Middle of the edge, in world coordinates. */
  at: Pt;
  /** Unit direction pointing away from the body, in world coordinates. */
  out: Pt;
  /** Length of the edge in millimetres. */
  length: number;
  feature?: EdgeFeature;
};

/** Every edge of a body: each panel's top and bottom, and the two outer sides. */
export function edgeSlots(node: PanelsNode, result: RenderResult): EdgeSlot[] {
  const info = result.nodes[node.id];
  if (!info || info.failed) return [];

  const chain = fullChain(result, node.id);
  const outward = (v: Pt): Pt => chain.reduce((d, t) => linear(d, t), v);
  const slots: EdgeSlot[] = [];

  const add = (path: string, label: string, anchor: string, out: Pt, length: number, feature?: EdgeFeature) => {
    const at = info.anchors[anchor];
    if (at) slots.push({ path, label, at, out: outward(out), length, feature });
  };
  const height = info.scalars.bodyHeight ?? 0;

  node.panels.forEach((p, i) => {
    const w = info.scalars[`${p.name}.width`] ?? 0;
    add(`panels.${i}.top`, `${p.name} · top`, `${p.name}.top`, [0, 1], w, p.top);
    add(`panels.${i}.bottom`, `${p.name} · bottom`, `${p.name}.bottom`, [0, -1], w, p.bottom);
  });

  const first = node.panels[0];
  const last = node.panels[node.panels.length - 1];
  if (first) add("left", "Left edge", `${first.name}.left`, [-1, 0], height, node.left);
  if (last) add("right", "Right edge", `${last.name}.right`, [1, 0], height, node.right);

  return slots;
}
