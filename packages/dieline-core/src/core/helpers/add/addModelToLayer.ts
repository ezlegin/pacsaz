import M, { IModel } from "makerjs";

export function pushModel(
  model: IModel,
  key: string,
  child: IModel,
  layer?: string,
) {
  M.model.addModel(model, child, key);
  if (layer) M.model.layer(child, layer);
}
