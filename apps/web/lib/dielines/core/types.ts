export type Dimensions = {
  width: number;
  height: number;
  length: number;
};

export type DielineModel = (params: Dimensions) => string;

export interface DielineDefinition {
  slug: string;
  title: string;
  description?: string;
  defaultDimensions: {
    width: number;
    height: number;
    length: number;
  };
  model: DielineModel;
}
