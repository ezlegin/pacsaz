import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { IModelMap } from "makerjs";
import { zero } from "../../data/consts";
import { Shape } from "../shapes/Shape";

export abstract class Model extends Shape {
  protected abstract trim(): IModelMap;
  protected fold(): IModelMap | void {}
  protected perf(): IModelMap | void {}

  protected get settings() {
    return getDielineSettings();
  }
  protected get width() {
    return this.settings.dimension.resolved.width;
  }
  protected get length() {
    return this.settings.dimension.resolved.length;
  }
  protected get height() {
    return this.settings.dimension.resolved.height;
  }
  protected get safeFoldOffset() {
    return this.settings.material.safeFoldOffset;
  }
  protected get thickness() {
    return this.settings.thickness;
  }

  $pushModel(key: string, trims: IModelMap, folds?: IModelMap) {
    this.models = {
      [key]: {
        models: {
          trims: { models: trims },
          folds: { models: folds },
        },
        origin: zero,
      },
    };
  }
}
