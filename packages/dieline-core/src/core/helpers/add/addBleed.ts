import M from "makerjs";
import Pacsaz from "../../pacsaz";

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
  Pacsaz.shape.push(cloned, "connectorLine", line);

  const chain = M.model.findSingleChain(cloned);
  const newTrimModel = M.chain.toNewModel(chain);

  const bleed = M.model.outline(newTrimModel, bleedAmount, 1);

  Pacsaz.shape.push(model, "bleed", bleed, "bleed");
  model.models = { bleed, ...model.models };

  return bleed;
}
