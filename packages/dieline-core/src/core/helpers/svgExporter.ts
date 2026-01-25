import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import M from "makerjs";
import { COLORS, GUIDES, strokeWidth } from "../../data/consts";
import { injectWatermark, Watermark } from "./injectWatermark";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";

type SvgExporterParams = {
  model: M.IModel;
  bleedModel: M.IModel;
  watermark: Watermark;
};

export function svgExporter({
  model,
  bleedModel,
  watermark,
}: SvgExporterParams) {
  const { showWatermark } = getDevCTX();
  const material = getDielineSettings().material?.value;

  const isCardboard =
    material === "glossy-cardboard" || material === "art-paper";

  const svg = M.exporter.toSVG(model, {
    cssStyle: "stroke-linecap: butt;",
    layerOptions: {
      bleed: {
        stroke: COLORS.dielines.bleed,
        fill: isCardboard ? COLORS.dielines.fill : "#f6efe4",
        strokeWidth: strokeWidth.svg,
      },
      trim: {
        stroke: COLORS.dielines.trim,
        strokeWidth: strokeWidth.svg,
      },
      fold: {
        stroke: COLORS.dielines.fold,
        strokeWidth: strokeWidth.svg,
        cssStyle: `stroke-dasharray:${GUIDES.foldDasharray}`,
      },
      guideBox: { fill: COLORS.guides.box, stroke: "none" },
      guideLine: {
        stroke: COLORS.guides.line,
        strokeWidth: strokeWidth.guide,
      },
      pointer: { stroke: "none", fill: COLORS.guides.line },
      pointerOverall: { stroke: "none", fill: "black" },
      guideText: {
        stroke: "none",
        fill: COLORS.guides.text,
        cssStyle: `direction: ltr; font-size: 20px`,
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

  return showWatermark
    ? injectWatermark(svg, bleedModel, watermark.offset)
    : svg;
}
