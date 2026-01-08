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
  const foldLine = new M.paths.Line([from, to]);

  M.path.addTo(foldLine, model, id);

  return foldLine;
}
