import M, { IModel } from "makerjs";
import { addLine } from "../add/addLine";

type Lines = {
  id: string;
  pts: M.IPoint[];
  filledRaudius?: number;
}[];

export function drawSingleLines(trimModel: IModel, lines: Lines) {
  const singlesModel: M.IModel = { models: {} };

  for (const line of lines) {
    const drawnLine = addLine(line.pts, false, line.filledRaudius);

    singlesModel.models![line.id] = drawnLine;
  }

  M.model.addModel(trimModel, singlesModel, "singles");
}
