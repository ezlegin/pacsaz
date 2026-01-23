import { ResolvedDimensions } from "../../data/types";
import { toMm } from "../../utils/sizeConvertor";

export function createDielineContext({
  length,
  width,
  height,
  offsets,
}: ResolvedDimensions) {
  const widthMM = toMm(width);
  const lengthMM = toMm(length);
  const heightMM = toMm(height ?? -1);

  return {
    width,
    length,
    height: height ?? -1,

    widthMM,
    lengthMM,
    heightMM,

    offsets,
  };
}
