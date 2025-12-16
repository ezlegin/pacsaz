import M from "makerjs";
import { colors, guides } from "../consts";

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
        stroke: colors.dielines.bleed,
        fill: colors.dielines.fill,
        strokeWidth: "1",
      },
      trim: { stroke: colors.dielines.trim, strokeWidth: "1" },
      fold: {
        stroke: colors.dielines.fold,
        strokeWidth: "1",
        cssStyle: `stroke-dasharray:${guides.foldDasharray}`,
      },
      guideBox: { fill: colors.guides.box, stroke: "none" },
      guideLine: { stroke: colors.guides.line },
      pointer: { stroke: "none", fill: colors.guides.line },
      guideText: {
        stroke: "none",
        fill: colors.guides.text,
        cssStyle: `direction: ltr`,
      },
    },
  });
}
