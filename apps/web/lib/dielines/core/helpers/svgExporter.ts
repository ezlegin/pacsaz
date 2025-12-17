import M from "makerjs";
import { COLORS, GUIDS, MARGINS } from "../consts";
import { mmToPt, ptToMm } from "../../../../utils/sizeConvertor";
import { SVGSizeProps } from "@/components/product/ProductDetails";

type SvgExporterParams = {
  model: M.IModel;
  getMeasurementFrom: M.IModel;
};

export function svgExporter({ model, getMeasurementFrom }: SvgExporterParams): {
  svg: string;
  svgSize: SVGSizeProps;
} {
  const containerSize = M.measure.modelExtents(getMeasurementFrom);

  const container = M.model.outline(
    new M.models.Rectangle(containerSize.width, containerSize.height),
    mmToPt(MARGINS.container),
    1
  );
  model.models!["container"] = container;
  model.models!["container"].layer = "container";

  return {
    svgSize: {
      widthMM: ptToMm(containerSize.width),
      lengthMM: ptToMm(containerSize.height),
    },
    svg: M.exporter.toSVG(model, {
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
        guideLine: { stroke: COLORS.guides.line, strokeWidth: "0.75" },
        pointer: { stroke: "none", fill: COLORS.guides.line },
        guideText: {
          stroke: "none",
          fill: COLORS.guides.text,
          cssStyle: `direction: ltr`,
        },
        container: { stroke: "none" },
      },
    }),
  };
}
