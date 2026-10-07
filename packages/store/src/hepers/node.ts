import { ISpec } from "../store/types";

export function findNodeWithParent(
  nodes: ISpec.Nodes,
  id: string,
): { node: ISpec.Node; parent: ISpec.Nodes } | null {
  for (const node of nodes) {
    if (node.id === id) return { node, parent: nodes };
    if (node.type === "group") {
      const found = findNodeWithParent(node.nodes, id);
      if (found) return found;
    }
  }
  return null;
}

export function groupNodes(
  state: ISpec.Nodes,
  ids: string[],
  group: ISpec.Group,
): void {
  if (ids.length < 2) return;

  const idSet = new Set(ids);

  const resolved: { node: ISpec.Node; parent: ISpec.Nodes }[] = [];
  for (const id of ids) {
    const found = findNodeWithParent(state, id);
    if (found) resolved.push(found);
  }
  if (resolved.length < 2) return;

  const targetParent = resolved[0]!.parent;

  let insertIndex = targetParent.length;
  for (let i = 0; i < targetParent.length; i++) {
    if (idSet.has(targetParent[i]!.id)) {
      insertIndex = i;
      break;
    }
  }

  const moved: ISpec.Node[] = [];
  for (const { node, parent } of resolved) {
    const idx = parent.indexOf(node);
    if (idx !== -1) parent.splice(idx, 1);
    moved.push(node);
  }

  group.nodes = moved;

  const safeIndex = Math.min(insertIndex, targetParent.length);
  targetParent.splice(safeIndex, 0, group);
}

export function findNode(
  nodes: ISpec.Node[],
  id: string,
): ISpec.Node | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.type === "group") {
      const found = findNode(node.nodes, id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export function removeNodeById(
  nodes: ISpec.Node[],
  id: string,
): ISpec.Node | undefined {
  const index = nodes.findIndex((node) => node.id === id);

  if (index !== -1) {
    return nodes.splice(index, 1)[0];
  }

  for (const node of nodes) {
    if (node.type !== "group") continue;

    const removed = removeNodeById(node.nodes, id);

    if (removed) {
      return removed;
    }
  }

  return undefined;
}

export function ungroupNodeById(nodes: ISpec.Node[], id: string): boolean {
  const index = nodes.findIndex((node) => node.id === id);

  if (index !== -1) {
    const node = nodes[index];

    if (node?.type !== "group") {
      return false;
    }

    nodes.splice(index, 1, ...node.nodes);

    return true;
  }

  for (const node of nodes) {
    if (node.type !== "group") continue;

    if (ungroupNodeById(node.nodes, id)) {
      return true;
    }
  }

  return false;
}
