import { getDielineCTX } from "@repo/store/dieline/context.store";
import { getDimension } from "@repo/store/dieline/dimension.store";
import M, { IModel } from "makerjs";
import { toMm } from "../../utils/sizeConvertor";
import { calculateSafeFoldOffset } from "./calculate/calculateSafeFoldOffset";

export function initiateModel() {
  const {
    resolved: { height, length, width },
  } = getDimension();
  const { customThickness, material, dimensionType } = getDielineCTX();

  const { safeFoldOffset: mSafeFoldOffset, thickness } = material;

  const safeFoldOffset = customThickness
    ? calculateSafeFoldOffset(customThickness)
    : mSafeFoldOffset;

  const materialThickness = customThickness ?? thickness;

  const widthMM = toMm(width);
  const lengthMM = toMm(length);
  const heightMM = toMm(height ?? -1);

  const { model, foldModel, trimModel, guideModel } = arrangeModels();

  return {
    width,
    widthMM,
    length,
    lengthMM,
    height,
    heightMM,

    dimensionType,
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
