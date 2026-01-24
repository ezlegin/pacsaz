import { getDielineCTX } from "@repo/store/dieline/context.store";
import { setOverallSize } from "@repo/store/dieline/overallSize.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import M from "makerjs";
import { MARGINS, onDevelepe } from "../../data/consts";
import { ModelExporter } from "../../data/types";
import { toPt } from "../../utils/sizeConvertor";
import { addAnchor } from "./add/addAnchor";
import { addBleed } from "./add/addBleed";
import { addContainer } from "./add/addContainer";
import { addOverallDimensionGuides } from "./add/addOverallDimensionGuides";
import { svgExporter } from "./svgExporter";

export function modelBuilder({
  model,
  trimModel,
  offsets,
  watermark,
}: ModelExporter) {
  const { showAnchors, showContainer, showOverallDimensions } = getDevCTX();

  const bleedAmount = toPt(getDielineCTX().bleed);
  const bleed = addBleed({
    model,
    trimModel,
    bleedAmount,
  });

  const cotainer = addContainer({
    model,
    from: trimModel,
    marginMM: showContainer ? MARGINS.container : 6, // 6 is the minimum amount to avoid clipping view
  });

  const bleedSize = M.measure.modelExtents(bleed);
  const containerSize = M.measure.modelExtents(cotainer);
  const trimSize = M.measure.modelExtents(trimModel);

  setOverallSize(() => ({
    overallSizes: {
      bleed: bleedSize,
      container: containerSize,
      trim: trimSize,
    },
  }));

  addAnchor(model, trimModel, showAnchors);

  addOverallDimensionGuides({
    model,
    trimModel,
    show: showOverallDimensions,
  });

  onDevelepe && console.log("Main Model:", model);
  return {
    sizes: {
      offset: {
        width: {
          inner: offsets.width.inner,
          outer: offsets.width.outer,
        },
        length: {
          inner: offsets.length.inner,
          outer: offsets.length.outer,
        },
      },
    },
    model: svgExporter({
      model,
      bleedModel: bleed,
      watermark,
    }),
  };
}
