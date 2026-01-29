import { materials } from "@repo/store/data/dieline";
import Pacsaz from "../core/pacsaz";
import { drawFoldLines } from "../core/helpers/draw/drawFoldLines";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { modelGenerator } from "../core/helpers/modelGenerator";
import { Dieline } from "../data/types";
import M from "makerjs";
import { zero } from "../data/consts";

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
      const rect = new Pacsaz.shapes.Rectangle(width * 2, length);
      const line = new Pacsaz.shapes.Line(width * 2, [0, 10]);

      Pacsaz.shape.push(trimModel, "test", rect);
      Pacsaz.shape.push(foldModel, "test", line);

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
