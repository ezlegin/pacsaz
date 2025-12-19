import { IModel } from "makerjs";

export function addModelToLayer(
  model: IModel,
  key: string,
  child: IModel,
  layer: string
) {
  model.models ??= {};
  model.models[key] = child;
  model.models[key].layer = layer;
}
