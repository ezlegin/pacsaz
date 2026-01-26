import { isSubscribed } from "@repo/store/app/user.store";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import M from "makerjs";
import { onProduction } from "../../data/consts";
import { extractPathDs } from "./extractPathDs";
import { svgSettings } from "./svgExporter";

export type WatermarkOffset = {
  x: number;
  y: number;
};

export type Watermark = {
  offset: WatermarkOffset;
};

export function injectWatermark(
  svg: string,
  clippingModel: M.IModel,
  offset?: WatermarkOffset
) {
  if (isSubscribed && onProduction) return svg;
  const { bleed } = getDielineSettings();

  const clipD = extractPathDs(M.exporter.toSVG(clippingModel));

  return svg.replace(
    "</svg>",
    `
  <defs>
    <pattern
      id="watermarkPattern"
      patternUnits="userSpaceOnUse"
      width="900"
      height="900"
    >
      <image
        href="/watermark.png"
        width="900"
        height="900"
        opacity="0.5"
        preserveAspectRatio="xMidYMid meet"
      />
    </pattern>

    <clipPath
      id="watermarkClip"
      transform="translate(${
        svgSettings.margins.container - bleed + (offset?.x ?? 0)
      }, ${svgSettings.margins.container - bleed + (offset?.y ?? 0)})"
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
`
  );
}
