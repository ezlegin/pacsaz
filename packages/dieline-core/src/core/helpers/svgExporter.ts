import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import M from "makerjs";
import { toMm } from "../../utils/sizeConvertor";
import { injectWatermark, Watermark } from "./injectWatermark";

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
  const materialKey = getDielineSettings().material?.value;

  const isCardboard =
    materialKey === "glossy-cardboard" || materialKey === "art-paper";
  M.exporter.colors;
  const svg = M.exporter.toSVG(model, {
    strokeLineCap: svgSettings.svg.strokeLineCap,
    units: svgSettings.unit,
    strokeWidth: svgSettings.svg.strokeWidth.main,
    fontSize: svgSettings.fontSize,
    scalingStroke: true,
    layerOptions: {
      bleed: {
        stroke: svgSettings.colors.dielines.bleed,
        fill: isCardboard ? svgSettings.colors.dielines.fill : "#f4efe9",
      },
      trim: {
        stroke: svgSettings.colors.dielines.trim,
      },
      fold: {
        stroke: svgSettings.colors.dielines.fold,
        cssStyle: `stroke-dasharray:${svgSettings.svg.guides.foldDasharray}`,
      },

      guideLine: {
        stroke: svgSettings.colors.guides.line,
        strokeWidth: svgSettings.svg.strokeWidth.guide.main,
      },
      guideLineOverall: {
        strokeWidth: svgSettings.svg.strokeWidth.guide.overall,
      },
      pointer: { stroke: "none", fill: svgSettings.colors.guides.line },
      pointerOverall: { stroke: "none", fill: "black" },
      guideText: {
        stroke: "none",
        fill: svgSettings.colors.guides.text,
        cssStyle: `direction: ltr;`,
      },
      guideTextOverall: {
        stroke: "none",
        fill: "black",
        cssStyle: `direction: ltr; font-size: 5`,
      },

      container: { stroke: "none" },
      anchor: { stroke: "none", fill: "black" },
    },
  });

  return showWatermark
    ? injectWatermark(svg, bleedModel, watermark.offset)
    : svg;
}

export const svgSettings = {
  unit: "mm",
  fontSize: toMm(20).toString(),
  svg: {
    strokeLineCap: "butt",
    strokeWidth: {
      main: toMm(1).toString(),
      guide: {
        main: toMm(1.25).toString(),
        overall: toMm(0.5).toString(),
      },
    },
    guides: {
      foldDasharray: [toMm(5), toMm(4)].join(","),
    },
  },
  colors: {
    dielines: {
      bleed: "green",
      trim: "blue",
      fold: "red",
      fill: "white",
      perforation: "orange",
    },
    guides: {
      line: "#1E90FF",
      text: "#1E90FF",
    },
  },
  margins: {
    container: 30,
    dimensionGuide: 20,
  },
};
