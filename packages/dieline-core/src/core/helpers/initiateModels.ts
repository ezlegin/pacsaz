import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import M, { IModel } from "makerjs";
import { calculateSafeFoldOffset } from "./calculate/calculateSafeFoldOffset";

export function initiateModel() {
  const {
    customThickness,
    material,
    dimension: { resolved },
  } = getDielineSettings();

  const { safeFoldOffset: mSafeFoldOffset, thickness } = material;

  const safeFoldOffset = customThickness
    ? calculateSafeFoldOffset(customThickness)
    : mSafeFoldOffset;

  const materialThickness = customThickness ?? thickness;

  const { model, foldModel, trimModel, guideModel } = arrangeModels();

  return {
    width: resolved.width,
    length: resolved.length,
    height: resolved.height,

    materialThickness,
    safeFoldOffset,

    model,
    foldModel,
    trimModel,
    guideModel,
  };
}

export function arrangeModels() {
  const model: IModel = { models: {} };

  const dieline: IModel = {};
  M.model.addModel(model, dieline, "dieline");

  const foldModel: IModel = {};
  M.model.addModel(dieline, foldModel, "fold");
  M.model.layer(foldModel, "fold");

  const trimModel: IModel = {};
  M.model.addModel(dieline, trimModel, "trim");
  M.model.layer(trimModel, "trim");

  const guideModel: IModel = {};
  M.model.addModel(model, guideModel, "guides");

  //todo: add perforation model as well

  return { model, guideModel, trimModel, foldModel };
}
