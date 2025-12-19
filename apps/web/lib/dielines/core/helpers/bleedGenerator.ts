import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

type AddBleedWithCompletorLineParams = {
  model: M.IModel;
  trimModel: M.IModel;
  bleedAmount: number;
  connectorLine: {
    from: M.IPoint;
    to: M.IPoint;
  };
};

export function addBleed({
  model,
  trimModel,
  bleedAmount,
  connectorLine: { from, to },
}: AddBleedWithCompletorLineParams): M.IModel {
  const connectorLine = new M.models.ConnectTheDots(false, [from, to]);

  const trimForBleed: M.IModel = {
    ...trimModel,
    models: {
      ...trimModel.models,
      glue: {},
      connectorLine,
    },
  };

  const bleed = M.model.outline(trimForBleed, bleedAmount, 1);

  addModelToLayer(model, "bleed", bleed, "bleed");
  model.models = { bleed, ...model.models };

  return bleed;
}
