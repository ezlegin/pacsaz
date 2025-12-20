import { toMm } from "@/utils/sizeConvertor";
import { Offsets } from "../types";

export function createDielineContext({
  length,
  width,
  height,
  offsets,
}: {
  width: number;
  length: number;
  height?: number;
  offsets: Offsets;
}) {
  const widthMM = toMm(width);
  const lengthMM = toMm(length);
  const heightMM = toMm(height ?? 0);

  return {
    width,
    length,
    height: height ?? 0,

    widthMM,
    lengthMM,
    heightMM,

    offsets,
  };
}
