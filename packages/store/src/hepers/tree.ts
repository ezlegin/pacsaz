import { ISpec } from "@repo/store/types";

export interface FlatNode {
  id: string;
  node: ISpec.Node;
  parentId: string | null;
  depth: number;
}

export function flattenTree(
  nodes: ISpec.Nodes,
  parentId: string | null = null,
  depth = 0,
): FlatNode[] {
  const out: FlatNode[] = [];
  for (const node of nodes) {
    out.push({ id: node.id, node, parentId, depth });
    if (node.type === "group") {
      out.push(...flattenTree(node.nodes, node.id, depth + 1));
    }
  }
  return out;
}

export function buildTree(flat: FlatNode[]): ISpec.Nodes {
  const root: ISpec.Nodes = [];
  const stack: { nodes: ISpec.Nodes; depth: number }[] = [
    { nodes: root, depth: -1 },
  ];

  for (const item of flat) {
    while (stack.length > 1 && stack[stack.length - 1]!.depth >= item.depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]!.nodes;

    const cloned: ISpec.Node =
      item.node.type === "group"
        ? { ...item.node, nodes: [] }
        : { ...item.node };

    parent.push(cloned);

    if (cloned.type === "group") {
      stack.push({ nodes: cloned.nodes, depth: item.depth });
    }
  }

  return root;
}

export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

interface Projection {
  depth: number;
  maxDepth: number;
  minDepth: number;
  parentId: string | null;
}

/**
 * Given the active + over ids and the horizontal drag offset, compute
 * what the item's new depth / parent should be.
 */
export function getProjection(
  items: FlatNode[],
  activeId: string,
  overId: string,
  dragOffsetX: number,
  indentationWidth: number,
): Projection {
  const overIndex = items.findIndex((i) => i.id === overId);
  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeItem = items[activeIndex];

  const reordered = arrayMove(items, activeIndex, overIndex);
  const previous = reordered[overIndex - 1];
  const next = reordered[overIndex + 1];

  const dragDepth = Math.round(dragOffsetX / indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = previous ? previous.depth + 1 : 0;
  const minDepth = next ? next.depth : 0;

  let depth = projectedDepth;
  if (projectedDepth >= maxDepth) depth = maxDepth;
  else if (projectedDepth < minDepth) depth = minDepth;

  const parentId = (() => {
    if (depth === 0 || !previous) return null;
    if (depth === previous.depth) return previous.parentId;
    if (depth > previous.depth) return previous.id;
    return (
      reordered
        .slice(0, overIndex)
        .reverse()
        .find((item) => item.depth === depth)?.parentId ?? null
    );
  })();

  return { depth, maxDepth, minDepth, parentId };
}

/** Given some top-level ids, also collect their descendants. */
export function expandWithDescendants(
  items: FlatNode[],
  ids: string[],
): string[] {
  const set = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of items) {
      if (item.parentId && set.has(item.parentId) && !set.has(item.id)) {
        set.add(item.id);
        changed = true;
      }
    }
  }
  return Array.from(set);
}
