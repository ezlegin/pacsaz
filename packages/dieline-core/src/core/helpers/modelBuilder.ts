import { getDielineCTX } from "@repo/store/dieline/context.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import { MARGINS, onDevelepe } from "../../data/consts";
import { ModelExporter } from "../../data/types";
import { toPt } from "../../utils/sizeConvertor";
import { addAnchor } from "./add/addAnchor";
import { addBleed } from "./add/addBleed";
import { addContainer } from "./add/addContainer";
import { addOverallDimensionGuides } from "./add/addOverallDimensionGuides";
import { getOverallSizes } from "./getSizes";
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

  const container = addContainer({
    model,
    from: trimModel,
    marginMM: showContainer ? MARGINS.container : 6, // 6 is the minimum amount to avoid clipping view
  });

  const { bleedSize, containerSize, trimSize } = getOverallSizes({
    bleed,
    container,
    trimModel,
  });

  addAnchor(model, trimModel, showAnchors);

  addOverallDimensionGuides({
    model,
    trimModel,
    show: showOverallDimensions,
  });

  onDevelepe && console.log("Main Model:", model);
  return {
    sizes: {
      container: containerSize,
      trim: trimSize,
      bleed: bleedSize,
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
