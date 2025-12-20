import M from "makerjs";
import { extractPathDs } from "./extractPathDs";
import { toMm, toPt } from "@/utils/sizeConvertor";
import { MARGINS } from "../consts";

export type WatermarkOffset = {
  x: number;
  y: number;
};

export function injectWatermark(
  svg: string,
  clippingModel: M.IModel,
  bleedAmount: number,
  { x, y }: WatermarkOffset
) {
  const clipD = extractPathDs(M.exporter.toSVG(clippingModel));

  const bleedAmountMM = toMm(bleedAmount);

  return svg.replace(
    "</svg>",
    `
      <clipPath transform="translate(${toPt(MARGINS.container - bleedAmountMM + x)}, ${toPt(MARGINS.container - bleedAmountMM + y)})" id="watermark">
        <path d="${clipD[0]}" />
      </clipPath>

    <image
      href="/watermark.png"
      width="100%"
      height="100%"
      opacity="0.4"
      clip-path="url(#watermark)"
    />
    </svg>
    `
  );
}
