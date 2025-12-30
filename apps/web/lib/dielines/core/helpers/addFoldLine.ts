import M from "makerjs";

interface AddFoldLineOptions {
  id: string;
  from: M.IPoint;
  to: M.IPoint;
}

export function addFoldLine(
  foldModel: M.IModel,
  { id, from, to }: AddFoldLineOptions
) {
  const foldLine = new M.paths.Line([from, to]);

  M.path.addTo(foldLine, foldModel, id);

  return foldLine;
}
