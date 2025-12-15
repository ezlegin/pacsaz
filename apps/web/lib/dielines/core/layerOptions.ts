import { colors, foldDasharray, guideTextFontSize } from "./consts";

export const coreLayerOptions = {
  bleed: { stroke: colors.bleed, fill: colors.dielineFill },
  trim: { stroke: colors.trim },
  fold: {
    stroke: colors.fold,
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
