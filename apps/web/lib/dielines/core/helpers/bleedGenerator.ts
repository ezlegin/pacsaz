import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

export type ConnectorLine = {
  from: M.IPoint;
  to: M.IPoint;
};
type AddBleedWithConnectorLineParams = {
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
}: AddBleedWithConnectorLineParams): M.IModel {
  const trimmedTrimModel: M.IModel = {
    ...trimModel,
    models: {
      ...trimModel.models,
      glue: {},
    },
  };

  let line: M.IModel = {};

  if (connectorLine) {
    const { from, to } = connectorLine;

    line = new M.models.ConnectTheDots(false, [from, to]);
  } else {
    const trimChain = M.model.findSingleChain(trimmedTrimModel);
    const trimKeyPoints = M.chain.toKeyPoints(trimChain);
    const startPoint = trimKeyPoints[0];
    const endPoint = trimKeyPoints[trimKeyPoints.length - 1];

    line = new M.models.ConnectTheDots(false, [startPoint!, endPoint!]);
  }

  trimmedTrimModel.models!["line"] = line;

  const bleed = M.model.outline(trimmedTrimModel, bleedAmount, 1);

  addModelToLayer(model, "bleed", bleed, "bleed");
  model.models = { bleed, ...model.models };

  return bleed;
}
