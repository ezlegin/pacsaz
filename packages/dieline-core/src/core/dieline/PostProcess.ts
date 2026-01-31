import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import M, { IModel } from "makerjs";

export class PostProcess {
  private trimModel: IModel = {};

  constructor(private main: IModel) {
    this.trimModel = this.main.models?.dieline?.models?.trim ?? {};
  }

  setSize() {
    const bleedSize = M.measure.modelExtents(this.main.models?.bleed!);
    const containerSize = M.measure.modelExtents(this.main.models?.container!);
    const trimSize = M.measure.modelExtents(this.trimModel);
    setOverallSize(() => ({
      overallSizes: {
        bleed: bleedSize,
        container: containerSize,
        trim: trimSize,
      },
    }));

    return this;
  }
}
