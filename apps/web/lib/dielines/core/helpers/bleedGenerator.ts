import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

export function addBleed(
  model: M.IModel,
  trimModel: M.IModel,
  bleedAmount: number
) {
  const bleed = M.model.outline(trimModel, bleedAmount, 1);
  addModelToLayer(model, "bleed", bleed, "bleed");
  model.models = { bleed, ...model.models };

  return bleed;
}
