import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";

export class Bleed implements IModel {
  constructor(trimModel: IModel, bleedAmount: number) {
    const cloned = M.model.clone(trimModel);
    const chain = M.model.findSingleChain(cloned);
    let keyPoints = M.chain.toKeyPoints(chain);

    const glue = cloned.models?.glue;
    if (glue) {
      delete cloned.models?.glue;
      const chain = M.model.findSingleChain(cloned);
      keyPoints = M.chain.toKeyPoints(chain);
    }

    const newTrimModel = new M.models.ConnectTheDots(true, keyPoints);

    const bleed = M.model.outline(newTrimModel, bleedAmount, 1);

    Pacsaz.shape.push(this, "bleed", bleed, "bleed");
  }
}
