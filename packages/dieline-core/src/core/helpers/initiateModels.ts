import M, { IModel } from "makerjs";
import { Models } from "./modelGenerator";

export function initiateModels(): Models {
  const model: IModel = { models: {} };

  const dielineModel: IModel = {};
  M.model.addModel(model, dielineModel, "dieline");

  const foldModel: IModel = {};
  M.model.addModel(dielineModel, foldModel, "fold");
  M.model.layer(foldModel, "fold");

  const trimModel: IModel = {};
  M.model.addModel(dielineModel, trimModel, "trim");
  M.model.layer(trimModel, "trim");

  const perforationModel: IModel = {};
  M.model.addModel(dielineModel, perforationModel, "perforation");

  const guideModel: IModel = {};
  M.model.addModel(model, guideModel, "guides");

  return { model, guideModel, trimModel, foldModel, perforationModel };
}
