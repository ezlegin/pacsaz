import { onDevelepe } from "@repo/lib/data/consts";
import { getDielineSettings } from "@repo/store/getters";
import { setOverallSizes } from "@repo/store/slices/overallSizesSlice";
import { store } from "@repo/store/store";
import M, { IModel, IModelMap } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Bleed } from "./Bleed";
import { Exporter } from "./Exporter";

export abstract class Dieline {
  protected main: IModel = {};
  protected trimModel: IModel = { layer: "trim" };
  protected foldModel: IModel = { layer: "fold" };
  protected perfModel: IModel = { layer: "perf" };
  protected rulerModel: IModel = { layer: "ruler" };

  // -------------- Dieline Factory --------------
  protected abstract drawShapes(): void;

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
    this.buildLayers();
    this.postProcess();
    console.group("Dieline");
    onDevelepe && console.log("Main:", this.main);
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

    this.drawShapes();

    const layers: IModelMap = {
      bleed: new Bleed(this.trimModel, this.settings.bleed),
      container: new Pacsaz.layer.Container(this.trimModel),
      fold: this.foldModel,
      perf: this.perfModel,
      trim: this.trimModel,
      anchor: new Pacsaz.layer.Anchor(this.main, this.trimModel),
    };

    for (const l in layers) {
      Pacsaz.shape.push(this.main, l, layers[l]!, l);
    }
  }

  // -------------- Post Process --------------
  private postProcess() {
    const trimModel = this.main.models?.trim;
    if (!trimModel) throw new Error("TrimModel not ready. [postProcess()]");

    const { bleed, container } = this.main.models ?? {};
    if (!bleed || !container) {
      throw new Error("Required computed layers are missing. [postProcess()]");
    }

    const bleedSize = M.measure.modelExtents(bleed);
    const containerSize = M.measure.modelExtents(container);
    const trimSize = M.measure.modelExtents(trimModel);
    store.dispatch(
      setOverallSizes({
        bleed: bleedSize,
        container: containerSize,
        trim: trimSize,
      }),
    );
  }

  protected $pushRuler(models: IModelMap) {
    for (const m in models) {
      const model = models[m];
      if (model) Pacsaz.shape.push(this.rulerModel, m, model);
    }
  }
}
