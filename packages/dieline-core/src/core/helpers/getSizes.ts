import M, { IModel } from "makerjs";

export function getOverallSizes({
  bleed,
  container,
  trimModel,
}: Record<"container" | "trimModel" | "bleed", IModel>) {
  return {
    containerSize: M.measure.modelExtents(container),
    trimSize: M.measure.modelExtents(trimModel),
    bleedSize: M.measure.modelExtents(bleed),
  };
}
