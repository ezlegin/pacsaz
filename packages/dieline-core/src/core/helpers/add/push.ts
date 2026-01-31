import M, { IModel } from "makerjs";

type Action = (
  model: IModel,
  key: string,
  child: IModel | IModel[],
  layer?: string,
  overwrite?: boolean,
) => void;

const action = (
  model: IModel,
  key: string,
  child: IModel,
  layer?: string,
  overwrite?: boolean,
) => {
  M.model.addModel(model, child, key, overwrite);
  if (layer) M.model.layer(child, layer);
};

export const pushModel: Action = (model, key, child, layer, overwrite) => {
  if (Array.isArray(child)) {
    for (const c of child) {
      action(model, key, c, layer, overwrite);
    }
  } else {
    action(model, key, child, layer, overwrite);
  }
};
