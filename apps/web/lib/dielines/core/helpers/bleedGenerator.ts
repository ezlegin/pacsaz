import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

export type ConnectorLine = {
  from: M.IPoint;
  to: M.IPoint;
};
type AddBleedWithCompletorLineParams = {
  model: M.IModel;
  trimModel: M.IModel;
  bleedAmount: number;
  connectorLine?: ConnectorLine;
};

export function addBleed({
  model,
  trimModel,
  bleedAmount,
  connectorLine,
}: AddBleedWithCompletorLineParams): M.IModel {
  let line: M.IModel = {};
  if (connectorLine) {
    const { from, to } = connectorLine;

    line = new M.models.ConnectTheDots(false, [from, to]);
  }

  const trimForBleed: M.IModel = {
    ...trimModel,
    models: {
      ...trimModel.models,
      glue: {},
      connectorLine: line,
    },
  };

  const bleed = M.model.outline(trimForBleed, bleedAmount, 1);

  addModelToLayer(model, "bleed", bleed, "bleed");
  model.models = { bleed, ...model.models };

  return bleed;
}
