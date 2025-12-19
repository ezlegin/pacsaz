import { ModelExporter } from "../types";
import { addAnchor } from "./addAnchor";
import { getSizes } from "./getSizes";
import { svgExporter } from "./svgExporter";

export function modelExporter({
  model,
  trim,
  bleed,
  container,
  bleedAmount,
  offsets,
  showAnchors,
}: ModelExporter) {
  const { bleedSize, containerSize, trimSize } = getSizes({
    bleed,
    container,
    trim,
  });

  addAnchor(model, trim, showAnchors);

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
