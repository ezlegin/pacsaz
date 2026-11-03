"use client";

import { updateNode, type DielineDocument, type Diagnostic } from "@repo/dieline-engine";
import { useCallback } from "react";
import { getIn, setIn } from "../model/fields";
import { useEditor, useStore } from "../state/react";
import type { ExpressionBinding } from "./ExpressionInput";

/**
 * Connects an input to a value in the document. Every write goes through the
 * store, so it is undoable and the canvas updates on the same render.
 */

const asText = (v: unknown) => (typeof v === "string" ? v : v === undefined || v === null ? "" : String(v));

/** A field of a node, by the same dotted path the engine reports errors with. */
export function useNodeField(nodeId: string, path: string, optional = false): ExpressionBinding {
  const store = useStore();
  const value = useEditor((s) => {
    const node = s.result.nodes[nodeId] ? findIn(s.doc, nodeId) : null;
    return asText(node ? getIn(node, path) : undefined);
  });
  const error = useEditor((s) => findError(s.result.diagnostics, (t) => t.type === "node" && t.id === nodeId && t.field === path));

  const set = useCallback(
    (next: string) =>
      store.apply((d) =>
        updateNode(d, nodeId, (n) => setIn(n, path, optional && next.trim() === "" ? undefined : next)),
      ),
    [store, nodeId, path, optional],
  );

  return { value, set, error };
}

/** Any other value in the document (variables, params, rulers). */
export function useDocField(
  path: string,
  matches: (target: Diagnostic["target"]) => boolean = () => false,
  optional = false,
): ExpressionBinding {
  const store = useStore();
  const value = useEditor((s) => asText(getIn(s.doc, path)));
  const error = useEditor((s) => findError(s.result.diagnostics, matches));

  const set = useCallback(
    (next: string) => store.apply((d) => setIn(d, path, optional && next.trim() === "" ? undefined : next)),
    [store, path, optional],
  );

  return { value, set, error };
}

/** Writes any value (booleans, enums, lists) to a node, as one undo step. */
export function useNodeSetter(nodeId: string) {
  const store = useStore();
  return useCallback(
    (path: string, value: unknown) => store.apply((d) => updateNode(d, nodeId, (n) => setIn(n, path, value))),
    [store, nodeId],
  );
}

export function useDocSetter() {
  const store = useStore();
  return useCallback(
    (path: string, value: unknown) => store.apply((d: DielineDocument) => setIn(d, path, value)),
    [store],
  );
}

function findError(list: Diagnostic[], matches: (t: Diagnostic["target"]) => boolean): string | undefined {
  return list.find((d) => d.severity === "error" && matches(d.target))?.message;
}

/** Node lookup cached per document, since selectors run on every store change. */
const cache = new WeakMap<DielineDocument, Map<string, unknown>>();

function findIn(doc: DielineDocument, id: string): unknown {
  let map = cache.get(doc);
  if (!map) {
    map = new Map();
    const walk = (nodes: DielineDocument["nodes"]) => {
      for (const n of nodes) {
        map!.set(n.id, n);
        if (n.kind === "group") walk(n.children);
      }
    };
    walk(doc.nodes);
    cache.set(doc, map);
  }
  return map.get(id);
}

export { findIn as findNodeCached };
