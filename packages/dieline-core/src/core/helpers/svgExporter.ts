import { isSubscribed } from "@repo/store/app/user.store";
import { getCTX } from "@repo/store/dieline/context.store";
import M from "makerjs";
import { COLORS, GUIDES, strokeWidth } from "../../data/consts";
import { injectWatermark, Watermark } from "./injectWatermark";

type SvgExporterParams = {
  model: M.IModel;
  bleedModel: M.IModel;
  bleedAmount: number;
  watermark: Watermark;
};

export function svgExporter({
  model,
  bleedModel,
  bleedAmount,
  watermark,
}: SvgExporterParams) {
  const material = getCTX().material.value;
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

  if (!watermark.show || isSubscribed) {
    return svg;
  }

  return injectWatermark(svg, bleedModel, bleedAmount, watermark.offset);
}
