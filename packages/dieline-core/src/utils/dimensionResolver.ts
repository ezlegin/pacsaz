import { Dimension } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { Offset, OffsetValue } from "./offsetResolver";

function applyDimensionOffset(value: number, offset: OffsetValue): number {
  const { dimensionType } = getDielineSettings();

  if (dimensionType === "inner") {
    return value + offset.inner;
  } else if (dimensionType === "outer") {
    return value - offset.outer;
  }
  return value;
}

export function resolveDimensions(
  dimension: Dimension,
  offsets: Offset
): Dimension {
  return {
    width: applyDimensionOffset(dimension.width, offsets.width)!,
    length: applyDimensionOffset(dimension.length, offsets.length)!,
    height: applyDimensionOffset(dimension.height, offsets.height)!,
  };
}

export function resolveDimension(value: number, offset: OffsetValue): number {
  return applyDimensionOffset(value, offset)!;
}
