import { MaterialValue } from "@/core/types";

export function getThicknessRange(MATERIALS: MaterialValue[]) {
  const thicknesses = Object.values(MATERIALS).map(
    (material) => material.thickness
  );

  return {
    min: Math.min(...thicknesses),
    max: Math.max(...thicknesses),
  };
}
