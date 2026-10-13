import type { ISpec } from "@repo/store/types";
import M from "makerjs";

type ArrayEffect = Extract<ISpec.ShapeEffect, { type: "array" }>;

export function applyArray(model: M.IModel, effect: ArrayEffect): M.IModel {
  const count = Math.max(1, Math.floor(+effect.repeat));
  if (count === 1) return model;

  const dx = +effect.moveX;
  const dy = +effect.moveY;

  const row: M.IModel = { models: {} };

  for (let i = 0; i < count; i++) {
    const copy = i === 0 ? model : (M.model.clone(model) as M.IModel);
    if (i > 0) M.model.moveRelative(copy, [dx * i, dy * i]);
    row.models![`array-${i}`] = copy;
  }

  return row;
}
