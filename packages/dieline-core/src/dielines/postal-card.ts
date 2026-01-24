import M from "makerjs";
import { addModelToLayer } from "../core/helpers/add/addModelToLayer";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { initiateModel } from "../core/helpers/initiateModels";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { BLEED, materials } from "../data/consts";
import { DielineGeneratorProps } from "../data/types";

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
  defaultBleed: BLEED.default,
  dimensionsType: ["manufacture"],
  materials: {
    default: materials["glossy-cardboard"],
    included: [materials["glossy-cardboard"], materials["art-paper"]],
  },
  model({ dimensions: { raw: rawDim, resolved }, dimensionType }) {
    const { model, foldModel, trimModel, guideModel, offsets, width, length } =
      initiateModel({
        resolved,
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
      offsets,
      watermark: {
        offset: {
          x: 0,
          y: 0,
        },
      },
    });
  },
};

export default postalCard;
