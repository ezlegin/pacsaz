import { ISpec } from "@repo/store/types";
import { nanoid } from "nanoid";
import { ComponentType } from "react";
import { UseFormReturn } from "react-hook-form";
import DoorProps from "../../components/DielineEditor/props/models/DoorProps";
import GlueProps from "../../components/DielineEditor/props/models/GlueProps";
import HoleProps from "../../components/DielineEditor/props/models/HoleProps";
import SnapLockProps from "../../components/DielineEditor/props/models/SnapLockProps";

/**
 * Registry for the opaque "model" node type.
 *
 * A model node is built by the engine from `params` on every render; the shape
 * nodes produced here are a non-authoritative mirror so the node still behaves
 * like a container (hide, duplicate, group) and reads sensibly wherever a node
 * tree is walked. They are never rendered.
 */

type ModelPropsComponent = ComponentType<{
  form: UseFormReturn<any, any, any>;
}>;

export const modelPropsComponents: Record<ISpec.ModelKey, ModelPropsComponent> =
  {
    glue: GlueProps,
    door: DoorProps,
    hole: HoleProps,
    snapLock: SnapLockProps,
  };

export const modelLabels: Record<ISpec.ModelKey, string> = {
  glue: "Glue",
  door: "Door",
  hole: "Hole",
  snapLock: "Snap Lock",
};

/* ------------------------------------------------------------------ */
/* Default params + form values                                        */
/* ------------------------------------------------------------------ */

/** Form values for a brand new model: node fields plus the model's own params. */
export function defaultModelValues(
  modelKey: ISpec.ModelKey,
): Record<string, unknown> {
  const base = {
    id: nanoid(),
    stack: "model",
    type: "model",
    modelKey,
    key: modelLabels[modelKey],
    hidden: false,
    origin: ["0", "0"],
    effects: [],
  };

  switch (modelKey) {
    case "glue":
      return { ...base, from: ["0", "0"], to: ["0", "40"] };
    case "door":
      return { ...base, dustSide: "left", mirror: { x: false, y: false } };
    case "hole":
      return {
        ...base,
        angleBetweenStartAndEnd: "45",
        heightOfLine: "10",
        rotation: "0",
        handleDir: "right",
      };
    case "snapLock":
      return base;
  }
}

/* ------------------------------------------------------------------ */
/* Node <-> params mapping                                             */
/* ------------------------------------------------------------------ */

const GENERALS = [
  "id",
  "key",
  "hidden",
  "stack",
  "type",
  "modelKey",
  "origin",
  "nodes",
  "dup",
  "effects",
] as const;

/** Splits flat form values into the node's `params` payload. */
export function toModelParams(
  values: Record<string, unknown>,
): ISpec.ModelParams[ISpec.ModelKey] {
  const params: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    if ((GENERALS as readonly string[]).includes(k)) continue;
    params[k] = v;
  }

  return params as ISpec.ModelParams[ISpec.ModelKey];
}

/** Re-expands a stored node into flat form values. */
export function fromModelNode(node: ISpec.Model): Record<string, unknown> {
  return {
    id: node.id,
    key: node.key,
    hidden: node.hidden,
    stack: node.stack,
    type: node.type,
    modelKey: node.modelKey,
    origin: node.origin,
    dup: node.dup,
    effects: node.effects ?? [],
    ...(node.params as Record<string, unknown>),
  };
}

/* ------------------------------------------------------------------ */
/* Child mirror                                                        */
/* ------------------------------------------------------------------ */

const rect = (
  key: string,
  width: number,
  height: number,
  origin: ISpec.Point,
  layer: ISpec.Layer,
): ISpec.RectangleSpec => ({
  id: nanoid(),
  type: "rectangle",
  key,
  stack: "shape",
  hidden: false,
  layer,
  origin,
  width: String(width),
  height: String(height),
  effects: [],
});

const line = (
  key: string,
  length: number,
  angle: string,
  origin: ISpec.Point,
  layer: ISpec.Layer,
): ISpec.LineSpec => ({
  id: nanoid(),
  type: "line",
  key,
  stack: "shape",
  hidden: false,
  layer,
  origin,
  length: String(length),
  angle,
  effects: [],
});

/**
 * Non-authoritative geometry mirror for a model node. Real geometry is produced
 * by the Drawer from `params`, which is why these stay schematic.
 */
export function modelChildMirror(node: ISpec.Model): ISpec.Nodes {
  switch (node.modelKey) {
    case "glue": {
      // `to`/`from` are symbolic and resolved by the engine, so the mirror uses a
      // fixed nominal height rather than trying to evaluate them.
      const MIRROR_HEIGHT = 40;
      return [
        rect("Glue", 16, MIRROR_HEIGHT, ["0", "0"], "trim"),
        line("Fold", MIRROR_HEIGHT, "90", ["0", "0"], "fold"),
      ];
    }

    case "door":
      return [
        rect("Door", 90, 160, ["0", "0"], "trim"),
        line("Tuck Flap", 90, "0", ["0", "0"], "fold"),
      ];

    case "hole":
      return [
        {
          id: nanoid(),
          type: "arc",
          key: "Hole",
          stack: "shape",
          hidden: false,
          layer: "trim",
          origin: ["0", "0"],
          radius: "2",
          startAngle: "0",
          endAngle: "180",
          effects: [],
        },
        line("Cut", 10, "0", ["0", "0"], "trim"),
      ];

    case "snapLock":
      return [
        rect("Snap Lock", 40, 30, ["0", "0"], "trim"),
        line("Fold", 40, "0", ["0", "0"], "fold"),
      ];
  }
}
