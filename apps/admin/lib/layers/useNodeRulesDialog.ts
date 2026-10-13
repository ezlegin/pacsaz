"use client";

import { useAppDispatch } from "@repo/store/hooks";
import { setNodeRules } from "@repo/store/slices/nodesSlice";
import { ISpec } from "@repo/store/types";
import { useState } from "react";

interface RulesDialogState {
  nodeId: string;
  nodeKey: string;
  rules: ISpec.NodeRule[];
}

/**
 * One stable reference for "this node has no rules". A fresh `[]` per render would
 * change the dialog's `initialRules` identity and reset edits while it is open.
 */
const NO_RULES: ISpec.NodeRule[] = [];

function findNode(nodes: ISpec.Nodes, id: string): ISpec.Node | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "group" || node.type === "model") {
      const found = findNode(node.nodes, id);
      if (found) return found;
    }
  }
}

/**
 * State for the per-node visibility rules dialog. Rules are edited as a whole set
 * and written back with a single `setNodeRules` dispatch.
 */
export function useNodeRulesDialog(nodes: ISpec.Nodes) {
  const dispatch = useAppDispatch();
  const [rulesDialog, setRulesDialog] = useState<RulesDialogState | null>(null);

  const openRules = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node) return;

    // Opening captures the node's rules; the dialog owns them until saved.
    setRulesDialog({
      nodeId,
      nodeKey: node.key,
      rules: node.rules ?? NO_RULES,
    });
  };

  const submitRules = (rules: ISpec.NodeRule[]) => {
    if (!rulesDialog) return;
    dispatch(setNodeRules({ nodeId: rulesDialog.nodeId, rules }));
    setRulesDialog(null);
  };

  const clearRules = (nodeId: string) => {
    dispatch(setNodeRules({ nodeId, rules: [] }));
  };

  return {
    rulesDialog,
    closeRules: () => setRulesDialog(null),
    openRules,
    submitRules,
    clearRules,
  };
}
