import { ModelExporter } from "../types";
import { getSizes } from "./getSizes";
import { svgExporter } from "./svgExporter";

export function modelExporter({
  model,
  trim,
  bleed,
  container,
  bleedAmount,
  offsets,
}: ModelExporter) {
  const { bleedSize, containerSize, trimSize } = getSizes({
    bleed,
    container,
    trim,
  });

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
    model: svgExporter({ model }),
  };
}
