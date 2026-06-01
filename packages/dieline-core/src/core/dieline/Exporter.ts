import { getDevCTX } from "@repo/store/dieline/developerTools.store";
import { setDielineFile } from "@repo/store/dieline/dielineFile.store";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import M, { IModel } from "makerjs";
import { toMm } from "../../utils/sizeConvertor";

export class Exporter {
  constructor(private main: IModel) {}
  private get format() {
    const { format } = getDielineSettings();
    return format;
  }

  build() {
    const svg = this.svg();

    if (this.format === "dxf") {
      setDielineFile(() => ({
        file: this.dxf(),
      }));
    } else {
      setDielineFile(() => ({
        file: svg,
      }));
    }

    return svg;
  }

  private svg() {
    const { showWatermark } = getDevCTX();
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
        bleed: { stroke: "green", fill: "white" },
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
          fill: "#00BFFF",
        },
        dielinePointer: {
          stroke: "none",
          fill: "#00BFFF",
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

    return showWatermark ? this.$injectWatermark(svg) : svg;
  }

  private dxf() {
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
      },
    });
  }

  // ------------ UTILS --------------

  private $injectWatermark(svg: string) {
    const bleedModel = this.main.models?.bleed;
    const containerModel = this.main.models?.container;

    if (!bleedModel || !containerModel) {
      console.error(
        "Bleed and Container Models Not Provided. [injectWatermark()]",
      );
      return svg;
    }

    const bleedSize = M.measure.modelExtents(bleedModel);
    const containerSize = M.measure.modelExtents(containerModel);

    const bleedX = bleedSize?.low[0]!;
    const bleedY = bleedSize?.high[1]!;
    const containerX = containerSize?.low[0]!;
    const containerY = containerSize?.high[1]!;

    const xShift = Math.abs(containerX - bleedX);
    const yShift = Math.abs(containerY - bleedY);

    const clipD = this.$extractPathDs(M.exporter.toSVG(bleedModel));

    return svg.replace(
      "</svg>",
      `
    <defs>
      <pattern
        id="watermarkPattern"
        patternUnits="userSpaceOnUse"
        width="300"
        height="300"
      >
        <image
          href="/watermark.png"
          width="300"
          height="300"
          opacity="0.5"
          preserveAspectRatio="xMidYMid meet"
        />
      </pattern>
  
      <clipPath
        id="watermarkClip"
        transform="translate(${xShift}, ${yShift})"
      >
        <path d="${clipD[0]}" />
      </clipPath>
    </defs>
  
    <rect
      width="100%"
      height="100%"
      fill="url(#watermarkPattern)"
      clip-path="url(#watermarkClip)"
    />
    </svg>
  `,
    );
  }

  $extractPathDs(svgString: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");

    const paths = Array.from(doc.querySelectorAll("path"));

    return paths.map((p) => p.getAttribute("d")!).filter(Boolean);
  }
}
