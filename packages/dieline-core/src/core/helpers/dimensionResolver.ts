import { toPt } from "../utils/sizeConvertor";
import { applyDimensionOffset, DimensionType } from "./applyDimensionOffset";

type MaterialLike = {
  offset: {
    inner: number; // mm
    outer: number; // mm
  };
};

type ResolveDimensionsParams = {
  width: number;
  length: number;
  height?: number;
  dimensionType: DimensionType;
  material: MaterialLike;
  customThickness?: number;
};

export function resolveDimensions({
  width,
  length,
  height,
  dimensionType,
  material,
  customThickness,
}: ResolveDimensionsParams) {
  const offsets = resolveOffsets(material, customThickness);

  return {
    width: resolveSingleDimension(width, dimensionType, offsets.width),
    length: resolveSingleDimension(length, dimensionType, offsets.length),
    height: resolveSingleDimension(height || 0, dimensionType, offsets.height),
    offsets,
  };
}

function resolveOffsets(material: MaterialLike, customThickness?: number) {
  const innerPt = toPt(material.offset.inner) * 2;
  const outerPt =
    toPt(customThickness ? customThickness : material.offset.outer) * 2;

  return {
    width: {
      inner: innerPt,
      outer: outerPt,
    },
    length: {
      inner: innerPt,
      outer: outerPt,
    },
    height: {
      inner: innerPt,
      outer: outerPt,
    },
  };
}

function resolveSingleDimension(
  value: number,
  dimensionType: DimensionType,
  offset: { inner: number; outer: number }
) {
  if (dimensionType === "manufacture") return value;

  return applyDimensionOffset(
    value,
    dimensionType,
    dimensionType === "inner" ? offset.inner : offset.outer
  );
}
