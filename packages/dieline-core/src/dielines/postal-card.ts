import M from "makerjs";
import { BLEED, MATERIALS } from "../data/consts";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { initiateModel } from "../core/helpers/initiateModels";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { DielineGeneratorProps } from "../data/types";
import { addModelToLayer } from "../core/helpers/add/addModelToLayer";

const postalCard: DielineGeneratorProps = {
  slug: "postal-card",
  title: "کارت پستال تا شو", //todo: sync to database, not here.
  dimensions: {
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
    included: [MATERIALS["glossy-cardboard"], MATERIALS["art-paper"]],
  },
  model({
    dimensions: {
      bleedSize,
      customThickness,
      raw: rawDim,
      resolved,
      container,
    },
    dimensionType,
    developers: { showAnchors, showOverallDimensions, showWatermark },
    selectedMaterial,
  }) {
    const {
      bleedAmount,
      width,
      model,
      foldModel,
      trimModel,
      guideModel,
      length,
      offsets,
    } = initiateModel({
      selectedMaterial,
      customThickness,
      bleedSize,
      resolved,
      defaultBleed: BLEED.default,
    });

    //! TRIM
    const rect = new M.models.Rectangle(width * 2, length);
    addModelToLayer(trimModel, "trim", rect);

    //! FOLD
    drawFoldLines(foldModel, {
      verticals: [{ from: [width, 0], to: [width, length] }],
    });

    //! GUIDES
    drawGuideLines(guideModel, {
      dimensionType,
      length,
      offsets,
      rawDim,
      width,
      guides: [
        { orientation: "vertical", type: "length" },
        { orientation: "horizontal", type: "width" },
      ],
    });

    return modelBuilder({
      model,
      trimModel,
      container,
      bleedAmount,
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
