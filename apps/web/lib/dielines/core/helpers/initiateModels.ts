import M, { IModel } from "makerjs";

export function initiateModels() {
  const model: IModel = { models: {} };

  const dieline: IModel = {};
  M.model.addModel(model, dieline, "dieline");

  const trimModel: IModel = {};
  M.model.addModel(dieline, trimModel, "trim");
  M.model.layer(trimModel, "trim");

  const foldModel: IModel = {};
  M.model.addModel(dieline, foldModel, "fold");
  M.model.layer(foldModel, "fold");

  const guideModel: IModel = {};
  M.model.addModel(model, guideModel, "guides");

  return { model, guideModel, dieline, trimModel, foldModel };
}
