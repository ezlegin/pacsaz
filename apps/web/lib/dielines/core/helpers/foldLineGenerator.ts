import M from "makerjs";

interface AddFoldLineOptions {
  id: string;
  from: M.IPoint;
  to: M.IPoint;
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
