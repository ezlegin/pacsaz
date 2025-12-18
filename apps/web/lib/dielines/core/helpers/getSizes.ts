import M from "makerjs";

export function getSizes({
  bleed,
  container,
  trim,
}: Record<"container" | "trim" | "bleed", M.IModel>) {
  return {
    containerSize: M.measure.modelExtents(container),
    trimSize: M.measure.modelExtents(trim),
    bleedSize: M.measure.modelExtents(bleed),
  };
}
