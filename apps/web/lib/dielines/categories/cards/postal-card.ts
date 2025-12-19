import { toPt } from "@/utils/sizeConvertor";
import M from "makerjs";
import { BLEED, MATERIALS } from "../../core/consts";
import { addModelToLayer } from "../../core/helpers/addModelToLayer";
import { addFoldLine } from "../../core/helpers/foldLineGenerator";
import { addGuideLine } from "../../core/helpers/guidelineGenerator";
import { modelBuilder } from "../../core/helpers/modelGenerator";
import { DielineDefinition } from "../../core/types";
import { drawFoldLines } from "../../core/helpers/drawFoldLines";

const postalCard: DielineDefinition = {
  slug: "postal-card",
  title: "کارت پستال تا شو", //todo: sync to database, not here.
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
    developers: { showAnchors },
  }) {
    const model: M.IModel = { models: {} };
    const bleedAmount = toPt(BLEED.default);

    const rect = new M.models.Rectangle(width * 2, length);

    //! TRIM
    const trim = rect;
    addModelToLayer(model, "trim", trim, "trim");

    //! FOLD
    drawFoldLines(model, [
      { type: "vertical", coords: { from: [width, 0], to: [width, length] } },
    ]);

    console.log(model);

    //! GUIDES
    addGuideLine(model, {
      type: "width",
      from: [0, length / 4],
      to: [width, length / 4],
      value: rawDim.width,
      orientation: "horizontal",
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
    });
    addGuideLine(model, {
      type: "length",
      from: [width / 4, 0],
      to: [width / 4, length],
      value: rawDim.length,
      orientation: "vertical",
      dimensionType,
      dimensionTypeOffset: {
        widthOffset: offsets.width,
        lengthOffset: offsets.length,
      },
    });

    return modelBuilder({
      model,
      trim,
      bleed: {
        bleedAmount,
      },
      showAnchors,
      offsets,
    });
  },
};

export default postalCard;
