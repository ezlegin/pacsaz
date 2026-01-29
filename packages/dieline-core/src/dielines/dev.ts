import { materials } from "@repo/store/data/dieline";
import P from "../core/pacsaz";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { modelGenerator } from "../core/helpers/modelGenerator";
import { Dieline } from "../data/types";

const dev: Dieline = {
  slug: "dev",
  title: "نمونه توسعه دهندگان",
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
      const rect = new P.shapes.Rectangle(width * 2, length);
      P.model.push(trimModel, "trim", rect);

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
    },
  ),
};

export default dev;
