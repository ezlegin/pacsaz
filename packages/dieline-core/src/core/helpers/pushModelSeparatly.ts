import M, { IModel, IPath } from "makerjs";

export function pushModelSeparatly(
  trimModel: IModel,
  foldModel: IModel,
  childModel: IModel,
  id: string
) {
  // add to trim model
  if (childModel.origin) {
    const childModelWithoutFolds: IModel = {
      models: childModel.models,
      origin: childModel.origin,
    };
    addModel(trimModel, childModelWithoutFolds, id);
  } else {
    addModel(trimModel, childModel.models?.trim!, id);
  }

  // add to fold model
  if (childModel.paths) {
    for (const path of Object.values(childModel.paths)) {
      if (childModel.origin) {
        const model: IModel = {
          origin: childModel.origin,
        };
        addPath(path, model, id);
        M.model.addModel(foldModel, model, `${id}-fold`);
      } else {
        addPath(path, foldModel, id);
      }
    }
  }

  // helpers
  function addPath(path: IPath, model: IModel, id: string) {
    M.path.addTo(path, model, `${id}-fold`);
  }
  function addModel(trimModel: IModel, childModel: IModel, id: string) {
    M.model.addModel(trimModel, childModel, id);
  }
}
