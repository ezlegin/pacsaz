export type Dimensions = {
  width: number;
  height: number;
  length: number;
};

export type DielineDimensions = {
  defaultDimensions: Dimensions;
  minDimensions: Dimensions;
  maxDimensions: Dimensions;
};

export type DielineModel = (params: Dimensions) => string;

export interface DielineDefinition {
  slug: string;
  title: string;
  description?: string;
  dimensions: DielineDimensions;
  model: DielineModel;
}
