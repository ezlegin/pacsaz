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
import { PostProcess } from "./PostProcess";

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
    length: 230,
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
  // Setting

  private get dimension() {
    return getDielineSettings().dimension.resolved;
  }
  protected get width() {
    return this.dimension.width;
  }
  protected get length() {
    return this.dimension.length;
  }
  protected get height() {
    return this.dimension.height;
  }

  model() {
    this.$upateDieline();

    new PostProcess(this.main).setSize();
    new ComputedLayers(this.main).applyBleed().applyContainer().applyAnchor();

    onDevelepe && console.log("Main Model:", this.main);
    return new Exporter(this.main).svg();
  }

  private $upateDieline() {
    function push(
      main: IModel,
      dieline: IModel,
      children: Record<string, IModel> | undefined,
      key: Lane,
    ) {
      Pacsaz.shape.push(dieline, key, { models: children }, key, true);
      Pacsaz.shape.push(main, "dieline", dieline, "dieline", true);
    }

    const fold = this.fold();
    if (fold) {
      push(this.main, this.dieline, fold, "fold");
    }
    const perf = this.perf();
    if (perf) {
      push(this.main, this.dieline, perf, "perf");
    }
    push(this.main, this.dieline, this.trim(), "trim");
  }
}
