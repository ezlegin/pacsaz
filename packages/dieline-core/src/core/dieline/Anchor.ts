import M, { IChain, IModel } from "makerjs";
import Pacsaz from "../Pacsaz";
import { getDevCTX } from "@repo/store/dieline/developerTools.store";

export class Anchor implements IModel {
  constructor(main: IModel, trimModel: IModel) {
    if (!getDevCTX().showAnchors) {
      delete main.models?.anchor;
      return;
    }

    const trimChains = M.model.findChains(trimModel);

    const holes: IModel = {};
    for (const chain of trimChains as IChain[]) {
      const keyPoints = M.chain.toKeyPoints(chain);
      const hole = new M.models.Holes(0.3, keyPoints);
      Pacsaz.shape.push(holes, "anchor", hole);
    }

    Pacsaz.shape.push(this, `anchor`, holes, `anchor`);
  }
}
