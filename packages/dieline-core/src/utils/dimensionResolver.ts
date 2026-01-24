import { Offset, OffsetVal } from "@repo/store/dieline/offset.store";
import { applyDimensionOffset, DimensionType } from "./applyDimensionOffset";

type ResolveDimensionsParams = {
  width: number;
  length: number;
  height?: number;
  dimensionType: DimensionType;
  offsets: Offset;
};

export function resolveDimensions({
  width,
  length,
  height,
  dimensionType,
  offsets,
}: ResolveDimensionsParams) {
  if (!offsets)
    throw new Error("Offsets Are not provided. [DimensionResolver]");

  return {
    width: resolveSingleDimension(width, dimensionType, offsets.width),
    length: resolveSingleDimension(length, dimensionType, offsets.length),
    height: resolveSingleDimension(height || 0, dimensionType, offsets.height),
  };
}

function resolveSingleDimension(
  value: number,
  dimensionType: DimensionType,
  offset: OffsetVal
) {
  if (dimensionType === "manufacture") return value;

  return applyDimensionOffset(
    value,
    dimensionType,
    dimensionType === "inner" ? offset.inner : offset.outer
  );
}
