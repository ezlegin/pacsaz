import { materials } from "@repo/store/data/dieline";
import { drawGuideLines } from "../core/helpers/draw/drawGuideLines";
import { modelBuilder } from "../core/helpers/modelBuilder";
import { modelGenerator } from "../core/helpers/modelGenerator";
import Pacsaz from "../core/pacsaz";
import { Dieline } from "../data/types";
import { Circle } from "../core/shapes/circle";

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
      Pacsaz.shape.push(trimModel, "trim", [rect]);

      //! FOLD
      const fold = new Pacsaz.shapes.Line(length, [width, 0], 90);
      const circle = new Pacsaz.shapes.Circle(10, [width, length]);
      Pacsaz.shape.push(foldModel, "fold", [fold, circle]);

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
