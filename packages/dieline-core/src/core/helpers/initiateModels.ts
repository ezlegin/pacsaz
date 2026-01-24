import { getDielineCTX } from "@repo/store/dieline/context.store";
import M, { IModel } from "makerjs";
import { ResolvedDimensions } from "../../data/types";
import { calculateSafeFoldOffset } from "./calculate/calculateSafeFoldOffset";
import { createDielineContext } from "./contextCreator";
import { toPt } from "../../utils/sizeConvertor";

interface InitiateModelsOptions {
  resolved: ResolvedDimensions;
}

export function initiateModel({ resolved }: InitiateModelsOptions) {
  const { customThickness, material } = getDielineCTX();

  const { safeFoldOffset: mSafeFoldOffset, thickness } = material;

  const safeFoldOffset = customThickness
    ? calculateSafeFoldOffset(customThickness)
    : mSafeFoldOffset;

  const materialThickness = customThickness ?? thickness;

  const { height, heightMM, length, lengthMM, width, widthMM, offsets } =
    createDielineContext(resolved);

  const { model, foldModel, trimModel, guideModel } = arrangeModels();

  const { dimension } = getDielineCTX();
  const rawDim = {
    width: toPt(dimension.width),
    length: toPt(dimension.length),
    height: toPt(dimension.height),
  };

  return {
    rawDim,
    materialThickness,
    safeFoldOffset,
    height,
    heightMM,
    length,
    lengthMM,
    width,
    widthMM,
    offsets,
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
