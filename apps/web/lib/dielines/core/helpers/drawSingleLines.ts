import M from "makerjs";

type Lines = {
  id: string;
  pts: M.IPoint[];
}[];

export function drawSingleLines(lines: Lines) {
  const singlesModel: M.IModel = { models: {} };

  for (const line of lines) {
    const drawnLine = new M.models.ConnectTheDots(false, line.pts);

    singlesModel.models![line.id] = drawnLine;
  }

  return singlesModel;
}
