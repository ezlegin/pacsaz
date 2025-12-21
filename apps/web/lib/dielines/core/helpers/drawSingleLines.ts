import M from "makerjs";
import { addLine } from "./addLine";

type Lines = {
  id: string;
  pts: M.IPoint[];
  filledRaudius?: number;
}[];

export function drawSingleLines(lines: Lines) {
  const singlesModel: M.IModel = { models: {} };

  for (const line of lines) {
    const drawnLine = addLine(line.pts, false, line.filledRaudius);

    singlesModel.models![line.id] = drawnLine;
  }

  return singlesModel;
}
