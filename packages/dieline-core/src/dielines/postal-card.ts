import M from "makerjs";
import { addModelToLayer } from "../core/helpers/add/addModelToLayer";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { modelGenerator } from "../core/helpers/modelGenerator";
import { Dieline } from "../data/types";
import { materials } from "@repo/store/data/dieline";

const postalCard: Dieline = {
  slug: "postal-card",
  title: "کارت پستال تا شو",
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
    default: materials["glossy-cardboard"],
    included: [materials["glossy-cardboard"], materials["art-paper"]],
  },
  model: modelGenerator(
    ({
      models: { foldModel, guideModel, model, trimModel },
      settings: {
        dimension: { length, width },
      },
    }) => {
      //! TRIM
      const rect = new M.models.Rectangle(width * 2, length);
      addModelToLayer(trimModel, "trim", rect);

      //! FOLD
      drawFoldLines(foldModel, {
        verticals: [{ from: [width, 0], to: [width, length] }],
      });

      //! GUIDES
      drawGuideLines(guideModel, {
        length,
        width,
        guides: [
          { orientation: "vertical", type: "length" },
          { orientation: "horizontal", type: "width" },
        ],
      });

      return modelBuilder({
        model,
        trimModel,
        watermark: {
          offset: {
            x: 0,
            y: 0,
          },
        },
      });
    }
  ),
};

export default postalCard;
