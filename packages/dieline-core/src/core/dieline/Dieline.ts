import { onDevelepe } from "@repo/lib/data/consts";
import { bleeds, materials } from "@repo/store/data/dieline";
import { Dimension, MaterialValue } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import M, { IModel, IModelMap } from "makerjs";
import { DimensionsType } from "../../data/types";
import Pacsaz from "../Pacsaz";
import { Exporter } from "./Exporter";

export interface IDieline {
  defaultDimensions: Dimension;
  minDimensions: Dimension;
  defaultBleed: number;
  dimensionsType: DimensionsType;
  materials: MaterialValue[];
  slug: string;
  model: () => string;
}

export abstract class Dieline implements IDieline {
  // -------------- Models --------------
  private main: IModel = {};
  protected trimModel: IModel = { layer: "trim" };
  protected foldModel: IModel = { layer: "fold" };

  // -------------- Defaults --------------
  abstract slug: string;
  abstract defaultDimensions: Dimension;
  defaultBleed = bleeds.default;
  minDimensions = {
    length: 30,
    width: 30,
    height: 30,
  };
  dimensionsType: DimensionsType = ["manufacture", "inner", "outer"];
  materials: MaterialValue[] = [
    materials["glossy-cardboard"],
    materials["art-paper"],
    materials["f-flute"],
  ];
  // -------------- Dieline Factory --------------
  protected abstract trim(): void;
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
  protected get safeFoldOffset() {
    return this.settings.safeFoldOffset;
  }

  // -------------- Model Generator --------------

  model() {
    console.group("Dieline");
    this.buildLayers();
    this.postProcess();
    onDevelepe && console.log("Main:", this.main);
    console.groupEnd();

    return new Exporter(this.main).svg();
  }

  // -------------- Layers --------------

  private buildLayers() {
    // Reset
    this.main = {};
    this.trimModel = { layer: "trim" };
    this.foldModel = { layer: "fold" };

    // Dieline Layers
    this.trim();
    this.fold();
    const perf = this.perf() ?? {};
    M.model.layer(perf, "perf");

    const dieline = {
      models: { fold: this.foldModel, perf, trim: this.trimModel },
    };

    // Main Layers
    const bleed = new Pacsaz.layer.Bleed(this.trimModel, this.settings.bleed);
    const container = new Pacsaz.layer.Container(this.trimModel);
    const dielineRuler = this.dielineRuler();
    const overallRuler = new Pacsaz.ruler.OverallRuler();

    // Dev Layers
    const anchor = new Pacsaz.layer.Anchor(this.main, this.trimModel);

    this.$pushLayers({
      bleed,
      container,
      dielineRuler,
      overallRuler,
      dieline,
      anchor,
    });
  }

  protected dielineRuler(): IModel {
    const dielineRuler = new Pacsaz.ruler.DielineRuler(this.width, this.length);
    return dielineRuler;
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

  private $pushLayers(layers: IModelMap) {
    for (const l in layers) {
      Pacsaz.shape.push(this.main, l, layers[l]!, l);
    }
  }

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

  protected $pushShapes(models: IModelMap, to: "trimModel" | "foldModel") {
    for (const m in models) {
      const model = models[m]!;
      Pacsaz.shape.push(this[to], m, model);
    }
  }
}
