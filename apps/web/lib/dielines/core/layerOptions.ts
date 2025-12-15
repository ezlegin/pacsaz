import { colors, foldDasharray, guideTextFontSize } from "./consts";
import M from "makerjs";

export const coreLayerOptions: {
  [layerId: string]: M.exporter.ISVGElementRenderOptions;
} = {
  bleed: { stroke: colors.bleed, fill: colors.dielineFill, strokeWidth: "1" },
  trim: { stroke: colors.trim, strokeWidth: "1" },
  fold: {
    stroke: colors.fold,
    strokeWidth: "1",
    cssStyle: `stroke-dasharray:${foldDasharray}`,
  },
  guideBox: { fill: colors.guideBox, stroke: "none" },
  guideLine: { stroke: colors.guideLine },
  pointer: { stroke: "none", fill: colors.guideLine },
  guideText: {
    stroke: "none",
    fill: colors.guideText,
    cssStyle: `font-size: ${guideTextFontSize}; direction: ltr`,
  },
};
