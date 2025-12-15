import M from "makerjs";
import { DielineDefinition } from "../../core/types";
import { addGuideLine } from "../../core/helpers/GuidelineGenerator";

export const postalCard: DielineDefinition = {
  slug: "postal-card",
  title: "کارت پستال دو برگ",
  defaultDimensions: {
    length: 160,
    width: 90,
    height: 0,
  },
  model({ width, length }) {
    const model: M.IModel = { models: {} };
    const rect = new M.models.Rectangle(width * 2, length);

    //! BLEED
    model.models!["bleed"] = M.model.outline(rect, 3, 1);
    model.models!["bleed"].layer = "bleed";

    //! TRIM
    const trim = rect;
    model.models!["trim"] = trim;
    model.models!["trim"].layer = "trim";

    //! FOLD
    const fold = new M.models.ConnectTheDots(false, [
      [width, 0],
      [width, length],
    ]);
    model.models!["fold"] = fold;
    model.models!["fold"].layer = "fold";

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

    return M.exporter.toSVG(model, {
      units: "mm",
      layerOptions: {
        bleed: { stroke: "green", fill: "white" },
        trim: { stroke: "blue" },
        fold: { stroke: "red", cssStyle: "stroke-dasharray:5,2;" },
        widthGuideBox: { fill: "white", stroke: "none" },
        lengthGuideBox: { fill: "white", stroke: "none" },
        widthGuideLine: { stroke: "dodgerBlue" },
        lengthGuideLine: { stroke: "dodgerBlue" },
        pointer: { stroke: "none", fill: "dodgerBlue" },
        widthGuideText: {
          stroke: "none",
          fill: "dodgerBlue",
          cssStyle: "font-size: 3.75; direction: ltr",
        },
        lengthGuideText: {
          stroke: "none",
          fill: "dodgerBlue",
          cssStyle: "font-size: 3.75; direction: ltr",
        },
      },
    });
  },
};
