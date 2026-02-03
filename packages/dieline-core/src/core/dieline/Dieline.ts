import { onDevelepe } from "@repo/lib/data/consts";
import { bleeds, materials } from "@repo/store/data/dieline";
import { Dimension, MaterialValue } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import M, { IModel } from "makerjs";
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
  protected abstract trim(): IModel;
  protected fold(): IModel | void {}
  protected perf(): IModel | void {}

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

  // -------------- Model Generator --------------

  model() {
    this.buildLayers();
    console.log("main", this.main);
    this.postProcess();

    onDevelepe && console.log("Main Model:", this.main);
    return new Exporter(this.main).svg();
  }

  // -------------- Layers --------------

  private buildLayers() {
    this.main = {};

    // Dieline Layers
    const trim = this.trim();
    M.model.layer(trim, "trim");
    const fold = this.fold() ?? {};
    M.model.layer(fold, "fold");
    const perf = this.perf() ?? {};
    M.model.layer(perf, "perf");
    const dieline = { models: { trim, fold, perf } };

    // Main Layers
    const bleed = new Pacsaz.layer.Bleed(trim, this.settings.bleed);
    const container = new Pacsaz.layer.Container(trim);
    const dielineRuler = this.dielineRuler();
    const overallRuler = new Pacsaz.ruler.OverallRuler();

    // Dev Layers
    const anchor = new Pacsaz.layer.Anchor(this.main, trim);

    this.$pushLayers({
      bleed,
      dieline,
      container,
      dielineRuler,
      overallRuler,
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

  private $pushLayers(layers: Record<string, IModel>) {
    for (const l in layers) {
      Pacsaz.shape.push(this.main, l, layers[l]!, l);
    }
  }
}
