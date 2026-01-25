import { Dimension, MaterialValue } from "@repo/store/data/types";

export type DimensionsType = ["manufacture"?, "inner"?, "outer"?];
type DielineDimensions = {
  defaultDimensions: Dimension;
  minDimensions: Dimension;
};
type MaterialsType = {
  default: MaterialValue;
  included: MaterialValue[];
};
export interface Dieline {
  slug: string;
  title: string;
  dimensions: DielineDimensions;
  defaultBleed?: number;
  dimensionsType: DimensionsType;
  materials: MaterialsType;
  model: () => string;
}

export type OffsetObject = Record<
  "widthOffset" | "lengthOffset" | "heightOffset",
  {
    inner: number;
    outer: number;
  }
>;
