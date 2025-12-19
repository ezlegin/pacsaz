import { IModel, IPoint } from "makerjs";
import { addFoldLine } from "./foldLineGenerator";
import { addModelToLayer } from "./addModelToLayer";

type Coordinates = { from: IPoint; to: IPoint }[];

export function drawFoldLines(
  model: IModel,
  folds: {
    verticals?: Coordinates;
    horizontals?: Coordinates;
    diagonal?: Coordinates;
  }
) {
  const typeCounters: Record<string, number> = {};

  const foldModel: IModel = { models: {} };
  addModelToLayer(model, "folds", foldModel, "folds");

  const foldTypes: { type: string; coords?: Coordinates }[] = [
    { type: "vertical", coords: folds.verticals },
    { type: "horizontal", coords: folds.horizontals },
    { type: "diagonal", coords: folds.diagonal },
  ];

  for (const { type, coords } of foldTypes) {
    if (!coords) continue;

    for (const { from, to } of coords) {
      typeCounters[type] = (typeCounters[type] || 0) + 1;

      addFoldLine(foldModel, {
        id: `fold-${type}-${typeCounters[type]}`,
        from,
        to,
      });
    }
  }
}
