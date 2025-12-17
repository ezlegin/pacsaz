import { mmToPt } from "@/utils/sizeConvertor";
import M from "makerjs";
import { BLEED, MARGINS, MATERIALS } from "../../core/consts";
import { applyDimensionOffset } from "../../core/helpers/applyDimensionOffset";
import { addContainer } from "../../core/helpers/containerGenerator";
import { addFoldLine } from "../../core/helpers/foldLineGenerator";
import { addGuideLine } from "../../core/helpers/guidelineGenerator";
import { svgExporter } from "../../core/helpers/svgExporter";
import { DielineDefinition, OffsetObject } from "../../core/types";

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
    default: MATERIALS["cardboard"],
    included: [MATERIALS["cardboard"]],
  },
  model({ dimension: { width: rawWidth, length: rawLength }, dimensionType }) {
    let width = rawWidth;
    let length = rawLength;

    const { lengthOffset, widthOffset }: OffsetObject = {
      widthOffset: {
        inner: mmToPt(5) * 2,
        outer: mmToPt(5) * 2,
      },
      lengthOffset: {
        inner: mmToPt(5) * 2,
        outer: mmToPt(5) * 2,
      },
    };

    width = applyDimensionOffset(
      width,
      dimensionType,
      dimensionType === "inner" ? widthOffset.inner : widthOffset.outer
    );
    length = applyDimensionOffset(
      length,
      dimensionType,
      dimensionType === "inner" ? lengthOffset.inner : lengthOffset.outer
    );

    const model: M.IModel = { models: {} };
    const rect = new M.models.Rectangle(width * 2, length);
    const bleedAmount = BLEED.default.pt;

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
      value: rawWidth,
      orientation: "horizontal",
      dimensionType,
      dimensionTypeOffset: { widthOffset, lengthOffset },
    });
    addGuideLine(model, {
      type: "length",
      from: [width / 4, 0],
      to: [width / 4, length],
      value: rawLength,
      orientation: "vertical",
      dimensionType,
      dimensionTypeOffset: { lengthOffset, widthOffset },
    });

    // SIZES
    const container = addContainer({
      model,
      from: rect,
      marginMM: MARGINS.container,
    });
    const trimSize = M.measure.modelExtents(trim);
    const bleedSize = M.measure.modelExtents(bleed);

    return {
      sizes: {
        container: container.size,
        trim: trimSize,
        bleed: bleedSize,
        bleedAmount,
        offset: {
          width: {
            inner: widthOffset.inner,
            outer: widthOffset.outer,
          },
          length: {
            inner: lengthOffset.outer,
            outer: lengthOffset.outer,
          },
        },
      },
      model: svgExporter({
        model,
      }),
    };
  },
};
