import { MaterialValue } from "../dieline/material.store";

export function getThicknessRange(MATERIALS: MaterialValue[]) {
  const thicknesses = Object.values(MATERIALS).map(
    (material) => material.thickness
  );

  return {
    min: Math.min(...thicknesses),
    max: Math.max(...thicknesses),
  };
}
