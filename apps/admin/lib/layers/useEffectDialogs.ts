"use client";

import { BooleanMode } from "@/components/layers/BooleanDialog";
import { useAppDispatch } from "@repo/store/hooks";
import {
  addEffect,
  removeEffect,
  updateEffect,
} from "@repo/store/slices/nodesSlice";
import { ISpec } from "@repo/store/types";
import { useState } from "react";
import { CornerRadius, RadiusKind } from "./constants";
import { RadiusSubmit } from "@/components/layers/RadiusDialog";

interface JoinDialogState {
  nodeId: string;
  effectIndex: number | null;
  initialMode: ISpec.JoinMode;
  shapeA: string;
  shapeB: string;
}

interface RadiusDialogState {
  nodeId: string;
  effectIndex: number | null;
  initialType: RadiusKind;
  initialTargets: string[];
  initialValue: string;
  initialRadii: CornerRadius[];
}

interface ArrayDialogState {
  nodeId: string;
  effectIndex: number | null;
  initialMoveX: string;
  initialMoveY: string;
  initialRepeat: string;
}

interface BooleanDialogState {
  nodeId: string;
  effectIndex: number | null;
  initialMode: BooleanMode;
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

const RADIUS_TYPES = new Set([
  "radius",
  "radiusAt",
  "customRadiusAt",
  "fullRadius",
]);

export function useEffectDialogs(nodes: ISpec.Nodes) {
  const dispatch = useAppDispatch();
  const [radiusDialog, setRadiusDialog] = useState<RadiusDialogState | null>(
    null,
  );
  const [arrayDialog, setArrayDialog] = useState<ArrayDialogState | null>(null);

  const [booleanDialog, setBooleanDialog] = useState<BooleanDialogState | null>(
    null,
  );
  const [joinDialog, setJoinDialog] = useState<JoinDialogState | null>(null);

  // ---------- Join ----------

  const openJoin = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type !== "group") return;

    const visibleChildren = node.nodes.filter((c) => !c.hidden);
    const shapeA = visibleChildren[0]?.key ?? "Shape 1";
    const shapeB = visibleChildren[1]?.key ?? "Shape 2";

    const effects = node.effects ?? [];
    const idx = effects.findIndex((e) => e.type === "join");

    if (idx >= 0) {
      const e = effects[idx] as Extract<ISpec.ShapeEffect, { type: "join" }>;
      setJoinDialog({
        nodeId,
        effectIndex: idx,
        initialMode: e.mode,
        shapeA,
        shapeB,
      });
    } else {
      setJoinDialog({
        nodeId,
        effectIndex: null,
        initialMode: "nearest",
        shapeA,
        shapeB,
      });
    }
  };

  const submitJoin = (mode: ISpec.JoinMode) => {
    if (!joinDialog) return;
    const { nodeId, effectIndex } = joinDialog;
    const effect: ISpec.ShapeEffect = { type: "join", mode };

    dispatch(
      effectIndex === null
        ? addEffect({ nodeId, effect })
        : updateEffect({ nodeId, index: effectIndex, changes: effect }),
    );
    setJoinDialog(null);
  };

  const removeJoin = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type !== "group") return;
    const idx = (node.effects ?? []).findIndex((e) => e.type === "join");
    if (idx < 0) return;
    dispatch(removeEffect({ nodeId, index: idx }));
  };

  // ---------- Boolean ----------
  const openBoolean = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type !== "group") return;

    const effects = node.effects ?? [];
    const idx = effects.findIndex((e) => e.type === "boolean");

    if (idx >= 0) {
      const e = effects[idx] as Extract<ISpec.ShapeEffect, { type: "boolean" }>;
      setBooleanDialog({ nodeId, effectIndex: idx, initialMode: e.mode });
    } else {
      setBooleanDialog({ nodeId, effectIndex: null, initialMode: "union" });
    }
  };

  const submitBoolean = (mode: BooleanMode) => {
    if (!booleanDialog) return;
    const { nodeId, effectIndex } = booleanDialog;
    const effect: ISpec.ShapeEffect = { type: "boolean", mode };

    dispatch(
      effectIndex === null
        ? addEffect({ nodeId, effect })
        : updateEffect({ nodeId, index: effectIndex, changes: effect }),
    );
    setBooleanDialog(null);
  };

  const removeBoolean = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node || node.type !== "group") return;
    const idx = (node.effects ?? []).findIndex((e) => e.type === "boolean");
    if (idx < 0) return;
    dispatch(removeEffect({ nodeId, index: idx }));
  };

  // ---------- Radius ----------
  const openRadius = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node) return;

    const effects = node.effects ?? [];
    const idx = effects.findIndex((e) => RADIUS_TYPES.has(e.type));

    if (idx >= 0) {
      const e = effects[idx] as Extract<
        ISpec.ShapeEffect,
        { type: RadiusKind }
      >;
      setRadiusDialog({
        nodeId,
        effectIndex: idx,
        initialType: e.type,
        initialTargets: e.type === "radiusAt" ? e.targets : [],
        initialValue: "value" in e ? e.value : "5",
        initialRadii: e.type === "customRadiusAt" ? e.radii : [],
      });
    } else {
      setRadiusDialog({
        nodeId,
        effectIndex: null,
        initialType: "radius",
        initialTargets: [],
        initialValue: "5",
        initialRadii: [],
      });
    }
  };

  const submitRadius = (payload: RadiusSubmit) => {
    if (!radiusDialog) return;
    const { nodeId, effectIndex } = radiusDialog;
    const { type, targets, value, radii } = payload;

    const effect: ISpec.ShapeEffect =
      type === "fullRadius"
        ? { type: "fullRadius" }
        : type === "customRadiusAt"
          ? { type: "customRadiusAt", radii }
          : type === "radiusAt"
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
    if (!node) return;
    const idx = (node.effects ?? []).findIndex((e) => RADIUS_TYPES.has(e.type));
    if (idx < 0) return;
    dispatch(removeEffect({ nodeId, index: idx }));
  };

  // ---------- Array ----------
  const openArray = (nodeId: string) => {
    const node = findNode(nodes, nodeId);
    if (!node) return;

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
    if (!node) return;
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

    booleanDialog,
    closeBoolean: () => setBooleanDialog(null),
    openBoolean,
    submitBoolean,
    removeBoolean,

    joinDialog,
    submitJoin,
    openJoin,
    closeJoin: () => setJoinDialog(null),
    removeJoin,
  };
}
