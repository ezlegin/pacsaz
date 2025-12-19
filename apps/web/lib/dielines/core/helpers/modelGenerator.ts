import { ModelExporter } from "../types";
import { addAnchor } from "./addAnchor";
import { addBleed } from "./bleedGenerator";
import { getSizes } from "./getSizes";
import { svgExporter } from "./svgExporter";

export function modelBuilder({
  model,
  trim,
  container,
  bleed: { bleedAmount, connectorLine },
  offsets,
  showAnchors,
}: ModelExporter) {
  const bleed = addBleed({
    model,
    trimModel: trim,
    bleedAmount,
    connectorLine,
  });

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
