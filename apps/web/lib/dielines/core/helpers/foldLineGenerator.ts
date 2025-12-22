import M from "makerjs";
import { addModelToLayer } from "./addModelToLayer";

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

  addModelToLayer(model, id, foldLine, "fold");

  return foldLine;
}
