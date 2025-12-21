import { MARGINS } from "../consts";
import { ModelExporter } from "../types";
import { addAnchor } from "./addAnchor";
import { addModelToLayer } from "./addModelToLayer";
import { addBleed } from "./bleedGenerator";
import { addContainer } from "./containerGenerator";
import { getSizes } from "./getSizes";
import { svgExporter } from "./svgExporter";

export function modelBuilder({
  model,
  trimModel,
  bleed: { bleedAmount, connectorLine },
  offsets,
  showAnchors,
  watermark,
}: ModelExporter) {
  const bleed = addBleed({
    model,
    trimModel,
    bleedAmount,
    connectorLine,
  });

  addModelToLayer(model, "trim", trimModel, "trim");

  const container = addContainer({
    model,
    from: trimModel,
    marginMM: MARGINS.container,
  });

  const { bleedSize, containerSize, trimSize } = getSizes({
    bleed,
    container,
    trimModel,
  });

  addAnchor(model, trimModel, showAnchors);

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
    }),
  };
}
