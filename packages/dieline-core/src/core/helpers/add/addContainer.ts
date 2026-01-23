import { toPt } from "../../../utils/sizeConvertor";
import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

interface AddContainerOptions {
  model: M.IModel;
  from: M.IModel;
  marginMM: number;
}

export function addContainer({ model, from, marginMM }: AddContainerOptions) {
  const { low, high } = M.measure.modelExtents(from)!;

  const marginPt = toPt(marginMM);

  const minX = low[0]!;
  const minY = low[1]!;
  const maxX = high[0]!;
  const maxY = high[1]!;

  const container = M.model.outline(
    new M.models.ConnectTheDots(true, [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
    ]),
    marginPt,
    1,
    false
  );

  addModelToLayer(model, "container", container, "container");

  return container;
}
