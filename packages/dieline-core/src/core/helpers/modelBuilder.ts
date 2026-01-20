import { MARGINS, onDevelepe } from "../../data/consts";
import { ModelExporter } from "../../data/types";
import { addAnchor } from "./add/addAnchor";
import { addContainer } from "./add/addContainer";
import { addOverallDimensionGuides } from "./add/addOverallDimensionGuides";
import { addBleed } from "./add/addBleed";
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
    marginMM: withContainer ? MARGINS.container : 6, // 6 is the minimum amount to avoid clipping view
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
