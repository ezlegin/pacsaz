import { SVGSizeProps } from "@/components/product/ProductDetails";

export type Dimensions = {
  width: number;
  height: number;
  length: number;
};

export type DimensionKey = "width" | "length" | "height";
export type DimensionsTypeType = ["manufacture"?, "inner"?, "outer"?];
export type FormatsType = "pdf" | "ai" | "dxf";

export type DielineDimensions = {
  initialScale?: number;
  defaultDimensions: Dimensions;
  minDimensions: Dimensions;
};

export type DielineModel = (params: Dimensions) => {
  svg: string;
  svgSize: SVGSizeProps;
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

export interface DielineDefinition {
  slug: string;
  title: string;
  dimensions: DielineDimensions;
  dimensionsType: DimensionsTypeType;
  materials: MaterialsInput;
  model: DielineModel;
}
