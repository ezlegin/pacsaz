import M from "makerjs";
import { COLORS, GUIDS } from "../consts";

type SvgExporterParams = {
  model: M.IModel;
};

export function svgExporter({ model }: SvgExporterParams) {
  return M.exporter.toSVG(model, {
    cssStyle: "stroke-linecap: butt;",
    layerOptions: {
      bleed: {
        stroke: COLORS.dielines.bleed,
        fill: COLORS.dielines.fill,
        strokeWidth: "0.75",
      },
      trim: { stroke: COLORS.dielines.trim, strokeWidth: "0.75" },
      fold: {
        stroke: COLORS.dielines.fold,
        strokeWidth: "0.75",
        cssStyle: `stroke-dasharray:${GUIDS.foldDasharray}`,
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
    },
  });
}
