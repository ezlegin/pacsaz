import { onDevelepe } from "@repo/lib/data/consts";
import { bleeds, materials } from "@repo/store/data/dieline";
import { Dimension, MaterialValue } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { IModel } from "makerjs";
import { Lane } from "../../data/core.types";
import { DimensionsType } from "../../data/types";
import Pacsaz from "../Pacsaz";
import { ComputedLayers } from "./ComputedLayers";
import { Exporter } from "./Exporter";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import M from "makerjs";

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
  // Defaults
  abstract slug: string;
  defaultBleed = bleeds.default;
  defaultDimensions = {
    width: 130,
    length: 240,
    height: 60,
  };
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
  // Factory
  protected abstract trim(): Record<string, IModel>;
  protected fold(): Record<string, IModel> | void {}
  protected perf(): Record<string, IModel> | void {}
  // Models
  private main: IModel = {};
  private dieline: IModel = {};

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

  model() {
    this.buildLayers();

    onDevelepe && console.log("Main Model:", this.main);
    return new Exporter(this.main).svg();
  }

  private buildLayers() {
    const fold = this.fold();
    if (fold) {
      this.push(fold, "fold");
    }
    const perf = this.perf();
    if (perf) {
      this.push(perf, "perf");
    }
    this.push(this.trim(), "trim");

    this.postProcess();

    new ComputedLayers(this.main)
      .applyBleed(this.settings.bleed)
      .applyContainer()
      .applyRuler(this.width, this.length);

    //todo: devs
  }

  private postProcess() {
    const trimModel = this.dieline.models?.trim;
    if (!trimModel) throw new Error("TrimModel not ready. [postProcess()]");

    const bleedSize = M.measure.modelExtents(this.main.models?.bleed!);
    const containerSize = M.measure.modelExtents(this.main.models?.container!);
    const trimSize = M.measure.modelExtents(trimModel);
    setOverallSize(() => ({
      overallSizes: {
        bleed: bleedSize,
        container: containerSize,
        trim: trimSize,
      },
    }));
  }

  // --------- UTILS ---------

  private push(children: Record<string, IModel>, key: Lane) {
    Pacsaz.shape.push(this.dieline, key, { models: children }, key, true);
    Pacsaz.shape.push(this.main, "dieline", this.dieline, "dieline", true);
  }
}
