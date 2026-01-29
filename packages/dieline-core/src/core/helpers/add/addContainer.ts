import M from "makerjs";
import Pacsaz from "../../pacsaz";

interface AddContainerOptions {
  model: M.IModel;
  from: M.IModel;
  margin: number;
}

export function addContainer({ model, from, margin }: AddContainerOptions) {
  const { low, high } = M.measure.modelExtents(from)!;

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
    margin,
    1,
    false,
  );

  Pacsaz.model.push(model, "container", container, "container");

  return container;
}
