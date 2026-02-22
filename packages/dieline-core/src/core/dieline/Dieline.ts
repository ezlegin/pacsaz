import { onDevelepe } from "@repo/lib/data/consts";
import { bleeds, materials } from "@repo/store/data/dieline";
import { Dimension, MaterialValue } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import M, { IModel, IModelMap } from "makerjs";
import { DimensionsType } from "../../data/types";
import Pacsaz from "../Pacsaz";
import { DielineRuler } from "../ruler/DielineRuler";
import { Bleed } from "./Bleed";
import { Exporter } from "./Exporter";

export abstract class Dieline {
  // -------------- Models --------------
  private main: IModel = {};
  protected trimModel: IModel = { layer: "trim" };
  protected foldModel: IModel = { layer: "fold" };
  protected perfModel: IModel = { layer: "perf" };

  // -------------- Defaults --------------
  abstract slug: string;
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
    return this.settings.material.safeFoldOffset;
  }

  // -------------- Model Generator --------------

  model() {
    console.group("Dieline");
    this.buildLayers();
    this.postProcess();
    onDevelepe && console.log("Main:", this.main);
    console.groupEnd();

    new Exporter(this.main).build();
  }

  // -------------- Layers --------------

  private buildLayers() {
    // Reset
    this.main = {};
    this.trimModel = { layer: "trim" };
    this.foldModel = { layer: "fold" };

    this.trim();
    this.fold();
    this.perf();

    const dieline: IModel = {
      models: {
        fold: this.foldModel,
        perf: this.perfModel,
        trim: this.trimModel,
      },
    };

    const bleed = new Bleed(this.trimModel, this.settings.bleed);
    const container = new Pacsaz.layer.Container(this.trimModel);
    const rulers = this.rulers();
    const anchor = new Pacsaz.layer.Anchor(this.main, this.trimModel);

    this.$pushLayers({
      bleed,
      container,
      dieline,
      rulers,
      anchor,
    });
  }

  // -------------- Rulers --------------
  private rulers() {
    return {
      models: {
        widthRuler: this.widthRuler(),
        lengthRuler: this.lengthRuler(),
        heightRuler: this.heightRuler(),
        overallRuler: new Pacsaz.ruler.OverallRuler(this.trimModel),
      },
      layer: "dielineRuler",
    };
  }
  protected get rulerOffset() {
    return this.width * 0.02;
  }
  protected widthRuler() {
    return new DielineRuler(
      [0, this.length / 4],
      [this.width, this.length / 4],
      this.width,
      this.rulerOffset,
    );
  }
  protected lengthRuler() {
    return new DielineRuler(
      [this.width * 2 + this.height * 1.5, 0],
      [this.width * 2 + this.height * 1.5, this.length],
      this.length,
      this.rulerOffset,
    );
  }
  protected heightRuler() {
    if (this.height === 0) return {};
    return new DielineRuler(
      [this.width, this.length / 1.5],
      [this.width + this.height, this.length / 1.5],
      this.height,
      this.rulerOffset,
    );
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
