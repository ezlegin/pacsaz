"use client";

import { useAppDispatch } from "@repo/store/hooks";
import {
  addEffect,
  removeEffect,
  updateEffect,
} from "@repo/store/slices/nodesSlice";
import { ISpec } from "@repo/store/types";
import { useState } from "react";
import { RadiusKind } from "./constants";

interface RadiusDialogState {
  nodeId: string;
  effectIndex: number | null;
  initialType: RadiusKind;
  initialTargets: string[];
  initialValue: string;
}

interface ArrayDialogState {
  nodeId: string;
  effectIndex: number | null;
  initialMoveX: string;
  initialMoveY: string;
  initialRepeat: string;
}

function findNode(nodes: ISpec.Nodes, id: string): ISpec.Node | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "group") {
      const found = findNode(node.nodes, id);
      if (found) return found;
    }
  }
}

const RADIUS_TYPES = new Set(["radius", "radiusAt"]);

export function useEffectDialogs(nodes: ISpec.Nodes) {
  const dispatch = useAppDispatch();
  const [radiusDialog, setRadiusDialog] = useState<RadiusDialogState | null>(
    null,
  );
  const [arrayDialog, setArrayDialog] = useState<ArrayDialogState | null>(null);

  // ---------- Radius ----------
  const openRadius = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type === "group") return;

    const effects = node.effects ?? [];
    const idx = effects.findIndex((e) => RADIUS_TYPES.has(e.type));

    if (idx >= 0) {
      const e = effects[idx] as Extract<
        ISpec.ShapeEffect,
        { type: "radius" | "radiusAt" }
      >;
      setRadiusDialog({
        nodeId,
        effectIndex: idx,
        initialType: e.type,
        initialTargets: e.type === "radiusAt" ? e.targets : [],
        initialValue: e.value,
      });
    } else {
      setRadiusDialog({
        nodeId,
        effectIndex: null,
        initialType: "radius",
        initialTargets: [],
        initialValue: "5",
      });
    }
  };

  const submitRadius = (type: RadiusKind, targets: string[], value: string) => {
    if (!radiusDialog) return;
    const { nodeId, effectIndex } = radiusDialog;
    const effect: ISpec.ShapeEffect =
      type === "radiusAt"
        ? { type: "radiusAt", targets, value }
        : { type: "radius", value };

    dispatch(
      effectIndex === null
        ? addEffect({ nodeId, effect })
        : updateEffect({ nodeId, index: effectIndex, changes: effect }),
    );
    setRadiusDialog(null);
  };

  const removeRadius = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type === "group") return;
    const idx = (node.effects ?? []).findIndex((e) => RADIUS_TYPES.has(e.type));
    if (idx < 0) return;
    dispatch(removeEffect({ nodeId, index: idx }));
  };

  // ---------- Array ----------
  const openArray = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type === "group") return;

    const effects = node.effects ?? [];
    const idx = effects.findIndex((e) => e.type === "array");

    if (idx >= 0) {
      const e = effects[idx] as Extract<ISpec.ShapeEffect, { type: "array" }>;
      setArrayDialog({
        nodeId,
        effectIndex: idx,
        initialMoveX: e.moveX,
        initialMoveY: e.moveY,
        initialRepeat: e.repeat,
      });
    } else {
      setArrayDialog({
        nodeId,
        effectIndex: null,
        initialMoveX: "0",
        initialMoveY: "10",
        initialRepeat: "3",
      });
    }
  };

  const submitArray = (moveX: string, moveY: string, repeat: string) => {
    if (!arrayDialog) return;
    const { nodeId, effectIndex } = arrayDialog;
    const effect: ISpec.ShapeEffect = { type: "array", moveX, moveY, repeat };

    dispatch(
      effectIndex === null
        ? addEffect({ nodeId, effect })
        : updateEffect({ nodeId, index: effectIndex, changes: effect }),
    );
    setArrayDialog(null);
  };

  const removeArray = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type === "group") return;
    const idx = (node.effects ?? []).findIndex((e) => e.type === "array");
    if (idx < 0) return;
    dispatch(removeEffect({ nodeId, index: idx }));
  };

  return {
    radiusDialog,
    closeRadius: () => setRadiusDialog(null),
    openRadius,
    submitRadius,
    removeRadius,

    arrayDialog,
    closeArray: () => setArrayDialog(null),
    openArray,
    submitArray,
    removeArray,
  };
}
