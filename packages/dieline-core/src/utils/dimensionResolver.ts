import {
  Dimension,
  DimensionType,
  DimensionUnit,
  Resolved,
} from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { Offset, OffsetValue } from "./offsetResolver";
import { toPt } from "./sizeConvertor";

export function resolveDimension(value: number, offset: OffsetValue) {
  const { dimensionType } = getDielineSettings();

  if (dimensionType === "manufacture") return value;

  return applyDimensionOffset(value, dimensionType, offset.inner, offset.outer);
}

function applyDimensionOffset(
  value: number,
  dimensionType: DimensionType,
  innerOffset: number,
  outerOffset: number
) {
  if (dimensionType === "inner") {
    return value + innerOffset;
  } else if (dimensionType === "outer") {
    return value - outerOffset;
  }
}

export function resolveDimensions(
  dimension: Dimension,
  offsets: Offset
): Resolved {
  const widthResolved = resolveDimension(dimension.width, offsets.width)!;
  const lengthResolved = resolveDimension(dimension.length, offsets.length)!;
  const heightResolved = resolveDimension(dimension.height, offsets.height)!;

  return {
    width: { mm: widthResolved, pt: toPt(widthResolved) },
    length: { mm: lengthResolved, pt: toPt(lengthResolved) },
    height: { mm: heightResolved, pt: toPt(heightResolved) },
  };
}

export function resolveSingleDimension(
  value: number,
  offset: OffsetValue
): DimensionUnit {
  const resolved = resolveDimension(value, offset)!;

  return { mm: resolved, pt: toPt(resolved) };
}
