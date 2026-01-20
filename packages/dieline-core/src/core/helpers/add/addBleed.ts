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
};

export function addBleed({
  model,
  trimModel,
  bleedAmount,
}: AddBleedWithConnectorLineParams): M.IModel {
  const cloned = M.model.clone(trimModel);
  delete cloned.models?.glue;

  const chianWithoutGlue = M.model.findSingleChain(cloned);
  const keyPoints = M.chain.toKeyPoints(chianWithoutGlue);
  const startPoint = keyPoints[keyPoints.length - 1]!;
  const endPoint = keyPoints[0]!;

  const line = new M.models.ConnectTheDots(false, [startPoint, endPoint]);
  M.model.addModel(cloned, line, "connectorLine");

  const chain = M.model.findSingleChain(cloned);
  const newTrimModel = M.chain.toNewModel(chain);

  const bleed = M.model.outline(newTrimModel, bleedAmount, 1, false, {
    pointMatchingDistance: 2,
  });

  addModelToLayer(model, "bleed", bleed, "bleed");
  model.models = { bleed, ...model.models };

  return bleed;
}
