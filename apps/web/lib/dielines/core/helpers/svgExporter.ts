import M from "makerjs";
import { COLORS, GUIDES } from "../consts";
import { injectWatermark, WatermarkOffset } from "./injectWatermark";

type SvgExporterParams = {
  model: M.IModel;
  bleedModel: M.IModel;
  bleedAmount: number;
  watermarkOffset: WatermarkOffset;
};

export function svgExporter({
  model,
  bleedModel,
  bleedAmount,
  watermarkOffset,
}: SvgExporterParams) {
  const svg = M.exporter.toSVG(model, {
    cssStyle: "stroke-linecap: butt;",
    layerOptions: {
      bleed: {
        stroke: COLORS.dielines.bleed,
        fill: COLORS.dielines.fill,
        cssStyle:
          "z-index: -20; background-image: url(/apps/web/public/watermark.png)",
        strokeWidth: "0.75",
      },
      trim: {
        stroke: COLORS.dielines.trim,
        strokeWidth: "0.75",
      },
      fold: {
        stroke: COLORS.dielines.fold,
        strokeWidth: "0.75",
        cssStyle: `stroke-dasharray:${GUIDES.foldDasharray}`,
      },
      guideBox: { fill: COLORS.guides.box, stroke: "none" },
      guideLine: {
        stroke: COLORS.guides.line,
        strokeWidth: "1",
      },
      pointer: { stroke: "none", fill: COLORS.guides.line },
      guideText: {
        stroke: "none",
        fill: COLORS.guides.text,
        cssStyle: `direction: ltr`,
      },
      container: { stroke: "none" },
      anchor: { stroke: "none", fill: "black" },
    },
  });

  return injectWatermark(svg, bleedModel, bleedAmount, watermarkOffset); //todo: only in production
}
