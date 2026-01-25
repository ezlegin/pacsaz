import { Dimension } from "@repo/store/dieline/dimension.store";
import { MaterialValue } from "@repo/store/dieline/material.store";

export type DimensionsType = ["manufacture"?, "inner"?, "outer"?];
export type DielineDimensions = {
  defaultDimensions: Dimension;
  minDimensions: Dimension;
};
export type MaterialsType = {
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

export type OffsetObjectParams = {
  inner: number;
  outer: number;
};

export type OffsetObject = {
  widthOffset: OffsetObjectParams;
  lengthOffset: OffsetObjectParams;
  heightOffset?: OffsetObjectParams;
};
