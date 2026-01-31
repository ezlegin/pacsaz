import {
  Dimension,
  DimensionType,
  MaterialValue,
} from "@repo/store/data/types";

export type DimensionsType = DimensionType[];
export interface Dieline {
  slug: string;
  title: string;
  defaultDimensions: Dimension;
  minDimensions: Dimension;
  defaultBleed?: number;
  dimensionsType: DimensionsType;
  materials: MaterialValue[];
  model: () => string;
}

export type OffsetObject = Record<
  "widthOffset" | "lengthOffset" | "heightOffset",
  {
    inner: number;
    outer: number;
  }
>;
