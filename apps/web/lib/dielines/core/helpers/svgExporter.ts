import M from "makerjs";
import { colors, guides } from "../consts";

type SvgExporterParams = {
  model: M.IModel;
  getMeasurementFrom: M.IModel;
};

export function svgExporter({ model, getMeasurementFrom }: SvgExporterParams) {
  const trimSize = M.measure.modelExtents(getMeasurementFrom);

  return M.exporter.toSVG(model, {
    cssStyle: "stroke-linecap: butt;",
    layerOptions: {
      bleed: {
        stroke: colors.dielines.bleed,
        fill: colors.dielines.fill,
        strokeWidth: "0.75",
      },
      trim: { stroke: colors.dielines.trim, strokeWidth: "0.75" },
      fold: {
        stroke: colors.dielines.fold,
        strokeWidth: "0.75",
        cssStyle: `stroke-dasharray:${guides.foldDasharray}`,
      },
      guideBox: { fill: colors.guides.box, stroke: "none" },
      guideLine: { stroke: colors.guides.line, strokeWidth: "0.75" },
      pointer: { stroke: "none", fill: colors.guides.line },
      guideText: {
        stroke: "none",
        fill: colors.guides.text,
        cssStyle: `direction: ltr`,
      },
    },
  });
}
