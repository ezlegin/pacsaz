import M from "makerjs";
import { colors, foldDasharray } from "../consts";

type SvgExporterParams = {
  model: M.IModel;
  modelToGetMeasurement: M.IModel;
  bleedPT: number;
};

export function svgExporter({
  model,
  modelToGetMeasurement,
  bleedPT,
}: SvgExporterParams) {
  const trimSize = M.measure.modelExtents(modelToGetMeasurement);
  const trimSizeWidth = trimSize.high[0];
  const trimSizeLength = trimSize.high[1];
  const viewBoxOffset = 2;
  const viewBoxWidth = trimSizeWidth! + bleedPT * 2 + viewBoxOffset * 2;
  const viewBoxLength = trimSizeLength! + bleedPT * 2 + viewBoxOffset * 2;

  return M.exporter.toSVG(model, {
    svgAttrs: {
      viewBox: `-${viewBoxOffset} -${viewBoxOffset} ${viewBoxWidth} ${viewBoxLength}`,
    },
    cssStyle: "stroke-linecap: butt;",
    layerOptions: {
      bleed: {
        stroke: colors.bleed,
        fill: colors.dielineFill,
        strokeWidth: "1",
      },
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
        cssStyle: `direction: ltr`,
      },
    },
  });
}
