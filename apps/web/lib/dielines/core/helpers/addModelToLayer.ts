import M from "makerjs";

export function addModelToLayer(
  model: M.IModel,
  key: string,
  child: M.IModel,
  layer: string
) {
  model.models ??= {};
  model.models[key] = child;
  model.models[key].layer = layer;
}
