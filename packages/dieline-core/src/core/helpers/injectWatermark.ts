import M from "makerjs";
import { MARGINS, onProduction } from "../../data/consts";
import { toMm, toPt } from "../../utils/sizeConvertor";
import { extractPathDs } from "./extractPathDs";
import { isSubscribed } from "@repo/store/app/user.store";
import { getBleed } from "@repo/store/dieline/bleed.store";

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
  const bleedAmount = toPt(getBleed());

  const clipD = extractPathDs(M.exporter.toSVG(clippingModel));

  const bleedAmountMM = toMm(bleedAmount);

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
      transform="translate(${toPt(
        MARGINS.container - bleedAmountMM + (offset?.x ?? 0)
      )}, ${toPt(MARGINS.container - bleedAmountMM + (offset?.y ?? 0))})"
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
