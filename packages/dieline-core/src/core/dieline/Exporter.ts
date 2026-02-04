import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import { toMm } from "../../utils/sizeConvertor";
import { injectWatermark } from "../helpers/injectWatermark";
import M, { IModel } from "makerjs";

export class Exporter {
  constructor(private main: IModel) {}

  svg() {
    const { showWatermark } = getDevCTX();
    const { material } = getDielineSettings();

    const isPaper =
      material.value === "glossy-cardboard" || material.value === "art-paper";

    const svg = M.exporter.toSVG(this.main, {
      units: "mm",
      strokeLineCap: "butt",
      fontSize: toMm(18).toString(),
      strokeWidth: toMm(1).toString(),
      scalingStroke: true,
      layerOptions: {
        trim: { stroke: "blue" },
        fold: {
          stroke: "red",
          cssStyle: `stroke-dasharray:${[toMm(5), toMm(4)].join(",")}`,
        },
        bleed: { stroke: "green", fill: isPaper ? "white" : "#f4efe9" },
        perf: {
          stroke: "fuchsia",
          strokeWidth: toMm(1.5).toString(),
          cssStyle: `stroke-dasharray:${[toMm(0.1), toMm(3)].join(",")}; stroke-linecap:round`,
        },
        container: {
          stroke: "none",
        },
        anchor: { fill: "black" },

        dielineRuler: {
          stroke: "#00BFFF",
          strokeWidth: toMm(1.5).toString(),
          fill: "#00BFFF",
          cssStyle: "stroke-linecap:round",
        },
        dielineRulerText: {
          stroke: "none",
          fill: "#00BFFF",
        },
        overallRuler: {
          stroke: "gray",
          fill: "gray",
        },
        overallRulerText: {
          fill: "gray",
          stroke: "none",
          cssStyle: `font-size: ${toMm(14)};`,
        },
      },
    });

    const bleed = this.main.models?.bleed;
    if (!bleed) {
      console.error("Bleed Not Provided. [exporter()]");
      return svg;
    }

    return showWatermark ? injectWatermark(svg, bleed, { x: 0, y: 0 }) : svg; //todo
  }

  dxf() {
    return M.exporter.toDXF(this.main, {
      units: "mm",
      fontSize: toMm(20),
      layerOptions: {
        trim: { color: 5 },
        fold: {
          color: 1,
          lineType: "DASHED",
        },
        bleed: { color: 3 },
        perf: {
          color: 6,
          lineType: "DOTTED",
        },
        container: {
          color: 0,
        },
        anchor: { color: 0 },
      },
    });
  }
}
