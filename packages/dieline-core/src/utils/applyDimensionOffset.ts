export type DimensionType = "manufacture" | "inner" | "outer";

export function applyDimensionOffset(
  value: number,
  dimensionType: DimensionType,
  offset: number
) {
  switch (dimensionType) {
    case "inner":
      return value + offset;
    case "outer":
      return value - offset;
    default:
      return value;
  }
}
