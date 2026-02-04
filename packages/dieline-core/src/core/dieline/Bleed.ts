import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";

export class Bleed implements IModel {
  constructor(trimModel: IModel, bleedAmount: number) {
    if (!trimModel) {
      console.error("Trim Model not Available.");
      return;
    }
    const cloned = M.model.clone(trimModel);
    const chain = M.model.findSingleChain(cloned);

    if (!chain) {
      const bleed = M.model.outline(cloned, bleedAmount, 1);
      Pacsaz.shape.push(this, "bleed", bleed, "bleed");
      return;
    }

    let keyPoints = M.chain.toKeyPoints(chain);

    const glue = cloned.models?.glue;
    if (glue) {
      delete cloned.models?.glue;
      const chain = M.model.findSingleChain(cloned);
      if (chain) keyPoints = M.chain.toKeyPoints(chain);
    }

    const newModel = M.chain.toNewModel(chain);

    const bleed = M.model.outline(newModel, bleedAmount, 1);
    Pacsaz.shape.push(this, "bleed", bleed, "bleed");
  }
}
