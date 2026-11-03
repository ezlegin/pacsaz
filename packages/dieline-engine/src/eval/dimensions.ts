export type DimensionType = "manufacture" | "inner" | "outer";
export type Dimensions = { width: number; length: number; height: number };

/**
 * Turns the size a customer asks for into the size the dieline is drawn at.
 *
 * Templates are drawn at manufacturing size (the crease-to-crease distance). An
 * inner size needs room for the board on both sides, so it grows by twice the
 * inner offset; an outer size shrinks by twice the outer offset. Both offsets
 * default to the board thickness.
 */
export function resolveDimensions(
  size: Dimensions,
  type: DimensionType,
  material: { thickness: number; innerOffset?: number; outerOffset?: number },
): Dimensions {
  if (type === "manufacture") return { ...size };

  const offset =
    type === "inner"
      ? 2 * (material.innerOffset ?? material.thickness)
      : -2 * (material.outerOffset ?? material.thickness);

  return {
    width: size.width + offset,
    length: size.length + offset,
    height: size.height + offset,
  };
}
