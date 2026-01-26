import { Dimension } from "@repo/store/data/types";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { IModel } from "makerjs";
import { initiateModels } from "./initiateModels";
import { calculateSafeFoldOffset } from "./calculate/calculateSafeFoldOffset";

type ModelSettings = {
  dimension: Dimension;
  safeFoldOffset: number;
};

type ModelKey =
  | "trimModel"
  | "foldModel"
  | "model"
  | "perforationModel"
  | "guideModel";

export type Models = Record<ModelKey, IModel>;
type Args = {
  settings: ModelSettings;
  models: Models;
};
type ModelGenerator = (args: Args) => string;

export const modelGenerator = (callBack: ModelGenerator) => () => {
  const dimension = getDielineSettings().dimension.resolved;
  const thickness = getDielineSettings().thickness;
  const models = initiateModels();

  return callBack({
    settings: {
      dimension,
      safeFoldOffset: calculateSafeFoldOffset(thickness),
    },
    models,
  });
};
