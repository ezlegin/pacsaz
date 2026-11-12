import type { FoldRig } from "./types";

/** The pieces of a rig: each still panel, with every panel that hangs from it. */
export const rigPieces = (rig: FoldRig): { face: number; members: number[] }[] => {
  const rootOf = (i: number): number => {
    let k = i;
    for (let guard = 0; rig.nodes[k]!.parent !== null && guard < rig.nodes.length; guard++) k = rig.nodes[k]!.parent!;
    return k;
  };
  const pieces = new Map<number, number[]>();
  rig.nodes.forEach((node, i) => {
    if (node.isHole) return;
    const root = rootOf(i);
    if (rig.nodes[root]!.isHole) return;
    pieces.set(root, [...(pieces.get(root) ?? []), i]);
  });
  return [...pieces.entries()].sort((a, b) => a[0] - b[0]).map(([face, members]) => ({ face, members }));
};
