export type DielineModel = (params: {
  width: number;
  height: number;
  length: number;
}) => string;

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
