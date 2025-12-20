import { toPt } from "@/utils/sizeConvertor";
import M from "makerjs";
import { BLEED, MATERIALS } from "../../core/consts";
import { addModelToLayer } from "../../core/helpers/addModelToLayer";
import { drawFoldLines } from "../../core/helpers/drawFoldLines";
import { drawGuideLines } from "../../core/helpers/drawGuideLines";
import { modelBuilder } from "../../core/helpers/modelGenerator";
import { DielineDefinition } from "../../core/types";

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
    addModelToLayer(model, "trim", rect, "trim");

    //! FOLD
    drawFoldLines(model, {
      verticals: [{ from: [width, 0], to: [width, length] }],
    });

    //! GUIDES
    drawGuideLines(model, {
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
      trimModel: rect,
      bleed: {
        bleedAmount,
      },
      showAnchors,
      offsets,
    });
  },
};

export default postalCard;
