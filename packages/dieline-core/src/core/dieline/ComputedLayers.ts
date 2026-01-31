import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import M, { IChain, IModel } from "makerjs";
import Pacsaz from "../Pacsaz";

export class ComputedLayers {
  devCTX = getDevCTX();
  settings = getDielineSettings();
  private trimModel: IModel = {};

  constructor(private main: IModel) {
    this.trimModel = this.main.models?.dieline?.models?.trim ?? {};
  }

  applyBleed() {
    const cloned = M.model.clone(this.trimModel);
    delete cloned.models?.glue;

    const chianWithoutGlue = M.model.findSingleChain(cloned);
    const keyPoints = M.chain.toKeyPoints(chianWithoutGlue);
    const startPoint = keyPoints[keyPoints.length - 1]!;
    const endPoint = keyPoints[0]!;

    const line = new M.models.ConnectTheDots(false, [startPoint, endPoint]);
    Pacsaz.shape.push(cloned, "connectorLine", line);

    const chain = M.model.findSingleChain(cloned);
    const newTrimModel = M.chain.toNewModel(chain);

    const bleed = M.model.outline(newTrimModel, this.settings.bleed, 1);

    this.main.models = { bleed, ...this.main.models };
    Pacsaz.shape.push(this.main, "bleed", bleed, "bleed", true);

    return this;
  }

  applyContainer() {
    const { low, high } = M.measure.modelExtents(this.trimModel)!;

    const minX = low[0]!;
    const minY = low[1]!;
    const maxX = high[0]!;
    const maxY = high[1]!;

    const container = M.model.outline(
      new M.models.ConnectTheDots(true, [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
      ]),
      this.devCTX.showContainer ? 30 : 6,
      1,
      false,
    );

    Pacsaz.shape.push(this.main, "container", container, "container", true);

    return this;
  }

  applyAnchor() {
    if (!this.devCTX.showAnchors) {
      delete this.main.models?.anchor;
      return;
    }

    const trimChains = M.model.findChains(this.trimModel);

    const holes: IModel = {};
    for (const chain of trimChains as IChain[]) {
      const keyPoints = M.chain.toKeyPoints(chain);
      const hole = new M.models.Holes(0.5, keyPoints);
      Pacsaz.shape.push(holes, "anchor", hole);
    }
    Pacsaz.shape.push(this.main, `anchor`, holes, `anchor`, true);

    return this;
  }
}
