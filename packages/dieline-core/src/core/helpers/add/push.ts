import M, { IModel } from "makerjs";

type Action = (
  model: IModel,
  key: string,
  child: IModel | IModel[],
  layer?: string,
) => void;

const action = (model: IModel, key: string, child: IModel, layer?: string) => {
  M.model.addModel(model, child, key);
  if (layer) M.model.layer(child, layer);
};

export const pushModel: Action = (model, key, child, layer) => {
  if (Array.isArray(child)) {
    for (const c of child) {
      action(model, key, c, layer);
    }
  } else {
    action(model, key, child, layer);
  }
};
