import M, { IModel } from "makerjs";

export function getMeasurementOfModel(model: IModel) {
  const { center, height, high, low, width } = M.measure.modelExtents(model)!;
  const bl = low;
  const tr = high;
  const tl = [low[0]!, high[1]!];
  const br = [high[0]!, low[1]!];

  return { center, width, height, bl, tr, tl, br };
}
