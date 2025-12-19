import { IModel, IPoint } from "makerjs";
import { addFoldLine } from "./foldLineGenerator";
import { addModelToLayer } from "./addModelToLayer";

export function drawFoldLines(
  model: IModel,
  fold: {
    type: "vertical" | "horizontal" | "diagonal";
    coords: { from: IPoint; to: IPoint };
  }[]
) {
  const typeCounters: Record<string, number> = {};

  const foldModel: IModel = { models: {} };
  addModelToLayer(model, "folds", foldModel, "folds");

  for (const {
    coords: { from, to },
    type,
  } of fold) {
    typeCounters[type] = (typeCounters[type] || 0) + 1;

    addFoldLine(foldModel, {
      id: `fold-${type}-${typeCounters[type]}`,
      from,
      to,
    });
  }
}
