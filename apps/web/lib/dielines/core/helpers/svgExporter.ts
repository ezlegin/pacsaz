import M from "makerjs";
import { colors, guides, margins } from "../consts";
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
    mmToPt(margins.container),
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
        container: { stroke: "none" },
      },
    }),
  };
}
