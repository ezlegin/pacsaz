import { onDevelepe } from "@repo/lib/data/consts";
import { bleeds, materials } from "@repo/store/data/dieline";
import { Dimension, MaterialValue } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import M, { IModel, IModelMap } from "makerjs";
import { DimensionsType } from "../../data/types";
import Pacsaz from "../Pacsaz";
import { Bleed } from "./Bleed";
import { Exporter } from "./Exporter";

export abstract class Dieline {
  // -------------- Models --------------
  protected main: IModel = {};
  protected trimModel: IModel = { layer: "trim" };
  protected foldModel: IModel = { layer: "fold" };
  protected perfModel: IModel = { layer: "perf" };
  protected rulerModel: IModel = { layer: "ruler" };

  // -------------- Defaults --------------
  abstract defaultDimensions: Dimension;
  defaultBleed = bleeds.default;
  minDimensions = {
    length: 40,
    width: 40,
    height: 40,
  };
  dimensionsType: DimensionsType = ["manufacture", "inner", "outer"];
  materials: MaterialValue[] = [
    materials["glossy-cardboard"],
    materials["art-paper"],
    materials["f-flute"],
  ];
  // -------------- Dieline Factory --------------
  protected abstract drawer(): void;
  protected fold(): void {}
  protected perf(): void {}

  // -------------- Settings --------------

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
  protected get thickness() {
    return this.settings.material.thickness;
  }

  // -------------- Model Generator --------------

  model() {
    console.group("Dieline");
    this.buildLayers();
    this.postProcess();
    onDevelepe && console.log("Main:", this.main);
    onDevelepe && console.log("Dieline:", this.main.models?.dieline?.models);
    console.groupEnd();

    return new Exporter(this.main).build();
  }

  // -------------- Layers --------------

  private buildLayers() {
    // Reset
    this.main = {};
    this.trimModel = { layer: "trim" };
    this.foldModel = { layer: "fold" };
    this.perfModel = { layer: "perf" };
    this.rulerModel = { layer: "ruler" };

    this.drawer();

    const dieline: IModel = {
      models: {
        fold: this.foldModel,
        perf: this.perfModel,
        trim: this.trimModel,
      },
    };

    const layers: IModelMap = {
      bleed: new Bleed(this.trimModel, this.settings.bleed),
      container: new Pacsaz.layer.Container(this.trimModel),
      dieline,
      ruler: this.rulerModel,
      anchor: new Pacsaz.layer.Anchor(this.main, this.trimModel),
    };

    for (const l in layers) {
      Pacsaz.shape.push(this.main, l, layers[l]!, l);
    }
  }

  // -------------- Post Process --------------

  private postProcess() {
    const trimModel = this.main.models?.dieline?.models?.trim;
    if (!trimModel) throw new Error("TrimModel not ready. [postProcess()]");

    const { bleed, container } = this.main.models ?? {};
    if (!bleed || !container) {
      throw new Error("Required computed layers are missing. [postProcess()]");
    }

    const bleedSize = M.measure.modelExtents(bleed);
    const containerSize = M.measure.modelExtents(container);
    const trimSize = M.measure.modelExtents(trimModel);
    setOverallSize(() => ({
      overallSizes: {
        bleed: bleedSize,
        container: containerSize,
        trim: trimSize,
      },
    }));
  }

  // -------------- Utils --------------

  protected $pushModels(models: IModelMap) {
    for (const m in models) {
      const parentModel = models[m]!;

      for (const key in parentModel.models) {
        const childModel = parentModel.models[key]!;
        const origin = childModel.origin;

        const trims: IModel = {
          models: childModel.models?.trims!.models,
          origin,
        };
        const folds: IModel = {
          models: childModel.models?.folds?.models,
          origin,
        };

        Pacsaz.shape.push(this.trimModel, m, trims);
        Pacsaz.shape.push(this.foldModel, m, folds);
      }
    }
  }

  protected $pushShape(
    model: IModel,
    key: string,
    layer: "trim" | "fold" | "perf" = "trim",
  ) {
    const pushTo =
      layer === "trim"
        ? this.trimModel
        : layer === "fold"
          ? this.foldModel
          : this.perfModel;
    Pacsaz.shape.push(pushTo, key, model);
  }

  protected $pushRuler(models: IModelMap) {
    for (const m in models) {
      const model = models[m];
      if (model) Pacsaz.shape.push(this.rulerModel, m, model);
    }
  }
}
