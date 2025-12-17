import M from "makerjs";
import { addFoldLine } from "../../core/helpers/foldLineGenerator";
import { addGuideLine } from "../../core/helpers/guidelineGenerator";
import { DielineDefinition } from "../../core/types";
import { svgExporter } from "../../core/helpers/svgExporter";
import { BLEED, MATERIALS } from "../../core/consts";

export const postalCard: DielineDefinition = {
  slug: "postal-card",
  title: "کارت پستال تا شو",
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
  dimensionsType: ["manufacture"],
  materials: {
    default: MATERIALS["cardboard"],
    included: [MATERIALS["cardboard"]],
  },
  model({ width, length }) {
    const model: M.IModel = { models: {} };
    const rect = new M.models.Rectangle(width * 2, length);

    //! BLEED
    const bleedModel = M.model.outline(rect, BLEED.sm.pt, 1);
    model.models!["bleed"] = bleedModel;
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
      value: width,
      orientation: "horizontal",
    });
    addGuideLine(model, {
      type: "length",
      from: [width / 4, 0],
      to: [width / 4, length],
      value: length,
      orientation: "vertical",
    });

    return svgExporter({
      model,
      getMeasurementFrom: rect,
    });
  },
};
