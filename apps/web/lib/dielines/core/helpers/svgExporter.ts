import M from "makerjs";
import { COLORS, GUIDES, MaterialKey } from "../consts";
import { injectWatermark, Watermark } from "./injectWatermark";

type SvgExporterParams = {
  model: M.IModel;
  bleedModel: M.IModel;
  bleedAmount: number;
  watermark: Watermark;
  material: MaterialKey;
};

export function svgExporter({
  model,
  bleedModel,
  bleedAmount,
  watermark,
  material,
}: SvgExporterParams) {
  const isCardboard =
    material === "glossy-cardboard" || material === "art-paper";

  const svg = M.exporter.toSVG(model, {
    cssStyle: "stroke-linecap: butt;",
    layerOptions: {
      bleed: {
        stroke: COLORS.dielines.bleed,
        fill: isCardboard ? COLORS.dielines.fill : "#f6efe4",
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
      pointerOverall: { stroke: "none", fill: "black" },
      guideText: {
        stroke: "none",
        fill: COLORS.guides.text,
        cssStyle: `direction: ltr`,
      },
      guideTextOverall: {
        stroke: "none",
        fill: "black",
        cssStyle: `direction: ltr`,
      },
      container: { stroke: "none" },
      anchor: { stroke: "none", fill: "black" },
    },
  });

  return watermark.show
    ? injectWatermark(svg, bleedModel, bleedAmount, watermark.offset)
    : svg;
}
