// lib/dielines/simple-box.ts
import M from "makerjs";
import { DielineDefinition } from "./types";

export const postalCard: DielineDefinition = {
  slug: "simple-box",
  title: "کارت پستال دو طرفه",
  code: 32978,
  defaultDimensions: {
    width: 90,
    height: 160,
    length: 0,
  },
  model({ width, height }) {
    const model: M.IModel = { models: {} };
    const rect = new M.models.Rectangle(width * 2, height);

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
      [width, height],
    ]);
    model.models!["fold"] = fold;
    model.models!["fold"].layer = "fold";

    return M.exporter.toSVG(model, {
      units: "mm",
      layerOptions: {
        bleed: { stroke: "green", fill: "white" },
        trim: { stroke: "blue" },
        fold: { stroke: "red", cssStyle: "stroke-dasharray:5,2;" },
      },
    });
  },
};
