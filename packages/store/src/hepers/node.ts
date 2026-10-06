import { ISpec } from "../store/types";

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

export function groupNodes(
  nodes: ISpec.Node[],
  ids: string[],
  group: ISpec.Group,
) {
  const extracted: ISpec.Node[] = [];

  for (const id of ids) {
    const node = removeNodeById(nodes, id);

    if (node) {
      extracted.push(node);
    }
  }

  group.nodes = extracted;

  nodes.push(group);
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
