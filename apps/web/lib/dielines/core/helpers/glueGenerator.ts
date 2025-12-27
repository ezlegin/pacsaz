import { IModel, IPoint } from "makerjs";
import { PointBuilder } from "../helpers/pointBuilder";
import { addLine } from "./addLine";
import { glueMapper } from "./glueMapper";
import M from "makerjs";

export function addGlue(
  trimModel: IModel,
  {
    customPoints = [
      [0, 0],
      [100, 100],
    ],
    heightMM,
    widthMM,
    normal,
    safeFoldOffset,
  }: {
    widthMM: number;
    heightMM: number;
    normal?: {
      margin: number;
      lengthMM: number;
    };
    customPoints?: IPoint[];
    safeFoldOffset: number;
  }
) {
  const pb = new PointBuilder();
  const size = glueMapper(widthMM, heightMM);

  const pts = normal
    ? pb
        .draw(-size, normal.margin)
        .up(normal.lengthMM - normal.margin * 2)
        .draw(size, normal.margin)
        .up(safeFoldOffset)
        .build()
    : customPoints;

  const glue = addLine(pts, false);

  M.model.addModel(trimModel, glue, "glue");
  return { model: glue, size };
}
