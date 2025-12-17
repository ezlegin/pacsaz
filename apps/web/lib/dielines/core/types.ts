import { DimensionType } from "./helpers/applyDimensionOffset";

export type Dimensions = {
  width: number;
  length: number;
  height: number;
};

export type DimensionKey = "width" | "length" | "height";
export type DimensionsType = ["manufacture"?, "inner"?, "outer"?];
export type FormatsType = "pdf" | "ai" | "dxf";

export type DielineDimensions = {
  initialScale?: number;
  defaultDimensions: Dimensions;
  minDimensions: Dimensions;
};

export type MaterialValue = {
  value: string;
  label: string;
  color: string;
  thicknessMM: number;
};

export type MaterialsInput = {
  default: MaterialValue;
  included: MaterialValue[];
};

export type SizesProps = {
  width: number;
  height: number;
};

export type SVGModelSizes = {
  container: SizesProps;
  trim: SizesProps;
  bleed: SizesProps;
  bleedAmount: number;
};

export type SVGModel = {
  model: string;
  sizes: SVGModelSizes;
};

export type DielineModel = (params: {
  dimension: Dimensions;
  dimensionType: DimensionType;
}) => SVGModel;

export interface DielineDefinition {
  slug: string;
  title: string;
  dimensions: DielineDimensions;
  dimensionsType: DimensionsType;
  materials: MaterialsInput;
  model: DielineModel;
}
