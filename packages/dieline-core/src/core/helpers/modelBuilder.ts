import { MARGINS, onDevelepe } from "../consts";
import { ModelExporter } from "../types";
import { addAnchor } from "./addAnchor";
import { addOverallDimensionGuides } from "./addOverallDimensionGuides";
import { addBleed } from "./bleedGenerator";
import { addContainer } from "./containerGenerator";
import { getSizes } from "./getSizes";
import { svgExporter } from "./svgExporter";

export function modelBuilder({
  model,
  trimModel,
  bleedAmount,
  offsets,
  showAnchors,
  watermark,
  material,
  showOverallDimensions,
  container: withContainer,
}: ModelExporter) {
  const bleed = addBleed({
    model,
    trimModel,
    bleedAmount,
  });

  const container = addContainer({
    model,
    from: trimModel,
    marginMM: withContainer ? MARGINS.container : 6,
  });

  const { bleedSize, containerSize, trimSize } = getSizes({
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
      bleedAmount,
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
      bleedAmount,
      watermark,
      material: material,
    }),
  };
}
