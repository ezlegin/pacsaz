import { toPt } from "@/utils/sizeConvertor";
import M from "makerjs";

interface AddContainerOptions {
  model: M.IModel;
  from: M.IModel;
  marginMM: number;
  id?: string;
  layer?: string;
}

export function addContainer({
  model,
  from,
  marginMM,
  id = "container",
  layer = "container",
}: AddContainerOptions) {
  const { low, high } = M.measure.modelExtents(from);

  const marginPt = toPt(marginMM);

  const minX = low[0]! - marginPt;
  const minY = low[1]! - marginPt;
  const maxX = high[0]! + marginPt;
  const maxY = high[1]! + marginPt;

  const container = M.model.outline(
    new M.models.ConnectTheDots(true, [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
    ]),
    0.1,
    1
  );

  model.models ??= {};
  model.models[id] = container;
  model.models[id].layer = layer;

  return container;
}
