import type { DielineDocument, GroupNode, Node } from "../spec/types";
import { renameRefs } from "./exprEdit";

/**
 * Immutable operations on a document's node tree. Every function returns a new
 * document and leaves the input untouched, which is what undo history needs.
 */

export type Located = {
  node: Node;
  parent: GroupNode | null;
  index: number;
  /** Ancestors from the root down to the parent. */
  ancestors: GroupNode[];
};

export function findNode(doc: DielineDocument, id: string): Located | null {
  const walk = (nodes: Node[], parent: GroupNode | null, ancestors: GroupNode[]): Located | null => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      if (node.id === id) return { node, parent, index: i, ancestors };
      if (node.kind === "group") {
        const found = walk(node.children, node, [...ancestors, node]);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(doc.nodes, null, []);
}

export function allNodes(doc: DielineDocument): Node[] {
  const out: Node[] = [];
  const walk = (nodes: Node[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.kind === "group") walk(n.children);
    }
  };
  walk(doc.nodes);
  return out;
}

/** Applies `fn` to every node list in the tree (the root and each group's children). */
function mapLists(nodes: Node[], fn: (list: Node[]) => Node[]): Node[] {
  return fn(nodes).map((n) => (n.kind === "group" ? { ...n, children: mapLists(n.children, fn) } : n));
}

export function updateNode(doc: DielineDocument, id: string, fn: (node: Node) => Node): DielineDocument {
  let changed = false;
  const nodes = mapLists(doc.nodes, (list) =>
    list.map((n) => {
      if (n.id !== id) return n;
      changed = true;
      return fn(n);
    }),
  );
  return changed ? { ...doc, nodes } : doc;
}

export function removeNodes(doc: DielineDocument, ids: readonly string[]): DielineDocument {
  const drop = new Set(ids);
  return { ...doc, nodes: mapLists(doc.nodes, (list) => list.filter((n) => !drop.has(n.id))) };
}

/** Inserts nodes into a group (or the root) at `index`, defaulting to the end. */
export function insertNodes(
  doc: DielineDocument,
  nodes: Node[],
  parentId: string | null = null,
  index?: number,
): DielineDocument {
  const insert = (list: Node[]) => {
    const copy = [...list];
    copy.splice(index ?? copy.length, 0, ...nodes);
    return copy;
  };

  if (parentId === null) return { ...doc, nodes: insert(doc.nodes) };
  return updateNode(doc, parentId, (n) => (n.kind === "group" ? { ...n, children: insert(n.children) } : n));
}

//! Names and ids ----------------------------------------------------------------

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** `base` if free, otherwise `base2`, `base3`, ... */
export function uniqueName(taken: Iterable<string>, base: string): string {
  const used = new Set(taken);
  const clean = base.replace(/[^A-Za-z0-9_]/g, "_").replace(/^(?=\d)/, "_") || "node";
  if (!used.has(clean)) return clean;

  const stem = clean.replace(/\d+$/, "");
  for (let i = 2; ; i++) {
    const candidate = `${stem}${i}`;
    if (!used.has(candidate)) return candidate;
  }
}

//! Expressions inside nodes ------------------------------------------------------

/** Fields that hold identifiers or enums, never expressions. */
const NOT_EXPR = new Set([
  "id", "name", "label", "kind", "lineType", "type", "action", "component",
  "openSide", "axis", "op", "description", "unit",
]);

/** Maps every expression string inside a value (node, ruler, ...). */
export function mapExprs<T>(value: T, fn: (expr: string) => string): T {
  const visit = (v: unknown, key: string | null): unknown => {
    if (typeof v === "string") return key !== null && NOT_EXPR.has(key) ? v : fn(v);
    if (Array.isArray(v)) return v.map((item) => visit(item, key === "children" ? null : key));
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v).map(([k, item]) => [k, k === "children" ? (item as Node[]).map((c) => visit(c, null)) : visit(item, k)]),
      );
    }
    return v;
  };
  return visit(value, null) as T;
}

/**
 * Renames a node and rewrites every reference to it, so renaming never breaks a
 * template.
 */
export function renameNode(doc: DielineDocument, id: string, name: string): DielineDocument {
  const located = findNode(doc, id);
  if (!located || located.node.name === name) return doc;

  const old = located.node.name;
  const rewrite = (expr: string) => renameRefs(expr, old, name);

  const renamed = updateNode(doc, id, (n) => ({ ...n, name }));
  return {
    ...renamed,
    nodes: renamed.nodes.map((n) => mapExprs(n, rewrite)),
    rulers: renamed.rulers.map((r) => mapExprs(r, rewrite)),
  };
}

/**
 * Copies nodes with fresh ids and names, inserted right after each original.
 * References between the copied nodes are pointed at the copies, so a duplicated
 * group of linked panels stays linked to itself rather than to the originals.
 */
export function duplicateNodes(doc: DielineDocument, ids: readonly string[]): { doc: DielineDocument; ids: string[] } {
  const taken = new Set(allNodes(doc).map((n) => n.name));
  const renames = new Map<string, string>();

  const cloneTree = (node: Node): Node => {
    const name = uniqueName(taken, node.name);
    taken.add(name);
    renames.set(node.name, name);
    const copy = { ...node, id: newId(), name } as Node;
    if (copy.kind === "group") copy.children = copy.children.map(cloneTree);
    return copy;
  };

  let next = doc;
  const created: string[] = [];

  for (const id of ids) {
    const located = findNode(next, id);
    if (!located) continue;

    renames.clear();
    let copy = cloneTree(located.node);
    copy = mapExprs(copy, (expr) => {
      let out = expr;
      for (const [from, to] of renames) out = renameRefs(out, from, to);
      return out;
    });

    next = insertNodes(next, [copy], located.parent?.id ?? null, located.index + 1);
    created.push(copy.id);
  }

  return { doc: next, ids: created };
}
