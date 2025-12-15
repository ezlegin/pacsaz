import M from "makerjs";

export type Point = [number, number];

interface AddFoldLineOptions {
  id: string;
  from: Point;
  to: Point;
}

export function addFoldLine(
  model: M.IModel,
  { id, from, to }: AddFoldLineOptions
) {
  const foldLine = new M.models.ConnectTheDots(false, [from, to]);

  model.models![id] = foldLine;
  model.models![id].layer = "fold";

  return foldLine;
}
