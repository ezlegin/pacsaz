import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { MATERIALS } from "../consts";
import { createDielineContext } from "./contextCreator";
import { ResolvedDimensions } from "../types";
import { calculateSafeFoldOffset } from "./calculateSafeFoldOffset";

interface InitiateModelsOptions {
  selectedMaterial: keyof typeof MATERIALS;
  customThickness?: number;
  bleedSize?: number;
  resolved: ResolvedDimensions;
  defaultBleed: number;
}

export function initiateModel({
  selectedMaterial,
  customThickness,
  bleedSize,
  defaultBleed,
  resolved,
}: InitiateModelsOptions) {
  const { safeFoldOffset: mSafeFoldOffset, thickness } =
    MATERIALS[selectedMaterial];

  const safeFoldOffset = customThickness
    ? calculateSafeFoldOffset(customThickness)
    : mSafeFoldOffset;

  const materialThickness = customThickness ?? thickness;
  const bleedAmount = bleedSize ? toPt(bleedSize) : toPt(defaultBleed);

  const { height, heightMM, length, lengthMM, width, widthMM, offsets } =
    createDielineContext(resolved);

  const { model, foldModel, trimModel, guideModel } = arrangeModels();

  return {
    materialThickness,
    safeFoldOffset,
    bleedAmount,
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

  const trimModel: IModel = {};
  M.model.addModel(dieline, trimModel, "trim");
  M.model.layer(trimModel, "trim");

  const foldModel: IModel = {};
  M.model.addModel(dieline, foldModel, "fold");
  M.model.layer(foldModel, "fold");

  const guideModel: IModel = {};
  M.model.addModel(model, guideModel, "guides");

  return { model, guideModel, trimModel, foldModel };
}
