export type Dimensions = {
  width: number;
  height: number;
  length: number;
};

export type DimensionsTypeType = ["manufacture"?, "inner"?, "outer"?];
export type FormatsType = "pdf" | "ai" | "dxf";

export type DielineDimensions = {
  initialScale?: number;
  defaultDimensions: Dimensions;
  minDimensions: Dimensions;
};

export type DielineModel = (params: Dimensions) => string;

export interface DielineDefinition {
  slug: string;
  title: string;
  dimensions: DielineDimensions;
  dimensionsType: DimensionsTypeType;
  model: DielineModel;
}
