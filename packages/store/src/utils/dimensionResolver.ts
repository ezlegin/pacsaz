import { DimensionType } from "@repo/store/dieline/dimensionType.store";
import { getOffset } from "@repo/store/dieline/offset.store";
import { DimensionKey } from "../dieline/dimension.store";
import { getDielineCTX } from "../dieline/context.store";

export function resolveDimension(key: DimensionKey, value: number) {
  const { dimensionType } = getDielineCTX();
  const offsets = getOffset();
  if (!offsets) throw new Error("Offsets not provided, [dimensionResolver]");

  if (dimensionType === "manufacture") return value;

  return applyDimensionOffset(
    value,
    dimensionType,
    offsets[key].inner,
    offsets[key].outer
  );
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
