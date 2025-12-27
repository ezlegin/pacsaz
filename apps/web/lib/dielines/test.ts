import { toPt } from "@/utils/sizeConvertor";
import M, { IModel, IPath, IPathMap } from "makerjs";
import { MATERIALS, BLEED } from "./core/consts";
import { addModelToLayer } from "./core/helpers/addModelToLayer";
import { drawFoldLines } from "./core/helpers/drawFoldLines";
import { drawGuideLines } from "./core/helpers/drawGuideLines";
import { modelBuilder } from "./core/helpers/modelBuilder";
import { DielineDefinition } from "./core/types";

const postalCard: DielineDefinition = {
  slug: "postal-card",
  title: "Test", //todo: sync to database, not here.
  dimensions: {
    initialScale: 1.5,
    defaultDimensions: {
      length: 160,
      width: 90,
      height: 0,
    },
    minDimensions: {
      length: 30,
      width: 30,
      height: 0,
    },
  },
  dimensionsType: ["manufacture", "inner", "outer"],
  materials: {
    default: MATERIALS["glossy-cardboard"],
    included: [
      MATERIALS["glossy-cardboard"],
      MATERIALS["f-flute"],
      MATERIALS["art-paper"],
    ],
  },
  model({
    dimensions: {
      raw: rawDim,
      resolved: { width, length, offsets },
    },
    dimensionType,
    developers: { showAnchors, showOverallDimensions, showWatermark },
    selectedMaterial,
  }) {
    const model: M.IModel = { models: {} };
    const bleedAmount = toPt(BLEED.default);

    const dieline: IModel = {};
    const trimModel: IModel = {};

    //! TRIM
    const poly = new M.models.ConnectTheDots(false, [
      [0, 0],
      [0, 100],
      [100, 100],
      [100, 0],
      [120, -50],
    ]);
    M.model.addModel(trimModel, poly, "myTrim");

    const fold = new M.paths.Line([
      [0, 0],
      [120, -50],
    ]);
    M.model.layer(fold, "fold");

    // layering
    M.model.addModel(dieline, trimModel, "trim");
    M.path.addTo(fold, dieline, "fold");

    // main laying
    M.model.addModel(model, dieline, "dieline");

    console.log(model);
    return modelBuilder({
      model,
      trimModel: trimModel,
      bleed: {
        bleedAmount,
      },
      showAnchors,
      offsets,
      material: selectedMaterial,
      showOverallDimensions,
      watermark: {
        show: showWatermark,
        offset: {
          x: 0,
          y: 0,
        },
      },
    });
  },
};

export default postalCard;

function addFoldsToDieline(dielineModel: IModel, folds: IPath[]) {
  for (const fold of folds) {
    M.model.layer(fold, "fold");
    M.path.addTo(fold, dielineModel, "fold");
  }
}
