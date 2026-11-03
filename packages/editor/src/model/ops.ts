import {
  allNodes,
  findNode,
  insertNodes,
  newId,
  offsetExpr,
  removeNodes,
  uniqueName,
  type DielineDocument,
  type Expr,
  type GroupNode,
  type Node,
  type RenderResult,
} from "@repo/dieline-engine";
import { topLevel } from "./frames";

/** Commands that reshape the tree. Each returns null when it does not apply. */

export function groupNodes(
  doc: DielineDocument,
  result: RenderResult,
  ids: string[],
): { doc: DielineDocument; id: string } | null {
  const roots = topLevel(result, ids);
  if (roots.length === 0) return null;

  // Grouping across different parents would silently move nodes between frames.
  const parent = result.nodes[roots[0]!]?.parentId ?? null;
  if (roots.some((id) => (result.nodes[id]?.parentId ?? null) !== parent)) return null;

  const located = roots.map((id) => findNode(doc, id)!).sort((a, b) => a.index - b.index);
  const group: GroupNode = {
    id: newId(),
    name: uniqueName(allNodes(doc).map((n) => n.name), "group"),
    kind: "group",
    children: located.map((l) => l.node),
  };

  const removed = removeNodes(doc, roots);
  return { doc: insertNodes(removed, [group], parent, located[0]!.index), id: group.id };
}

/** Why a group cannot be dissolved without changing the drawing, or null. */
export function ungroupBlocker(group: GroupNode): string | null {
  const t = group.transform;
  if (t?.rotate && t.rotate.trim() !== "0") return "The group is rotated";
  if (t?.mirrorX || t?.mirrorY) return "The group is mirrored";
  if (group.modifiers?.length) return "The group has modifiers";
  if (group.combine) return "The group combines its children";
  if (group.rules?.length) return "The group has visibility rules";
  return null;
}

/** Adds a group offset to a child coordinate, keeping both formulas. */
function shift(child: Expr | undefined, by: Expr | undefined): Expr | undefined {
  if (!by || by.trim() === "" || by.trim() === "0") return child;
  if (/^\s*-?(\d+\.?\d*|\.\d+)\s*$/.test(by)) return offsetExpr(child ?? "0", Number(by));
  const base = child && child.trim() !== "0" ? `${child} + ` : "";
  return `${base}(${by})`;
}

export function ungroupNode(doc: DielineDocument, id: string): { doc: DielineDocument; ids: string[] } | null {
  const located = findNode(doc, id);
  if (!located || located.node.kind !== "group") return null;
  const group = located.node;
  if (ungroupBlocker(group)) return null;

  const gx = group.transform?.x;
  const gy = group.transform?.y;
  const children: Node[] = group.children.map((child) => {
    const x = shift(child.transform?.x, gx);
    const y = shift(child.transform?.y, gy);
    if (x === child.transform?.x && y === child.transform?.y) return child;
    return { ...child, transform: { ...child.transform, ...(x ? { x } : {}), ...(y ? { y } : {}) } };
  });

  const removed = removeNodes(doc, [id]);
  return {
    doc: insertNodes(removed, children, located.parent?.id ?? null, located.index),
    ids: children.map((c) => c.id),
  };
}

/** Ungroups every group among `ids`; null when none of them can be dissolved. */
export function ungroupNodes(doc: DielineDocument, ids: readonly string[]): { doc: DielineDocument; ids: string[] } | null {
  let next = doc;
  const out: string[] = [];
  for (const id of ids) {
    const r = ungroupNode(next, id);
    if (r) {
      next = r.doc;
      out.push(...r.ids);
    }
  }
  return out.length ? { doc: next, ids: out } : null;
}
