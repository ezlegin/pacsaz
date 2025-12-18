import M from "makerjs";
import { BLEED, MARGINS, MATERIALS } from "../../core/consts";
import { addContainer } from "../../core/helpers/containerGenerator";
import { addFoldLine } from "../../core/helpers/foldLineGenerator";
import { addGuideLine } from "../../core/helpers/guidelineGenerator";
import { modelExporter } from "../../core/helpers/modelGenerator";
import { DielineDefinition } from "../../core/types";

export const postalCard: DielineDefinition = {
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
  }) {
    const model: M.IModel = { models: {} };
    const bleedAmount = BLEED.default.pt;

    const rect = new M.models.Rectangle(width * 2, length);

    //! BLEED
    const bleed = M.model.outline(rect, bleedAmount, 1);
    model.models!["bleed"] = bleed;
    model.models!["bleed"].layer = "bleed";

    //! TRIM
    const trim = rect;
    model.models!["trim"] = trim;
    model.models!["trim"].layer = "trim";

    //! FOLD
    addFoldLine(model, {
      id: "centerFold",
      from: [width, 0],
      to: [width, length],
    });

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

    const container = addContainer({
      model,
      from: rect,
      marginMM: MARGINS.container,
    });

    return modelExporter({
      model,
      trim,
      bleed,
      bleedAmount,
      container,
      offsets,
    });
  },
};
