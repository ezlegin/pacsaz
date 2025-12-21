import { IPoint } from "makerjs";
import { PointBuilder } from "../helpers/pointBuilder";
import { addLine } from "./addLine";
import { glueMapper } from "./glueMapper";

export function addGlue({
  customPoints = [
    [0, 0],
    [100, 100],
  ],
  heightMM,
  widthMM,
  normal,
}: {
  widthMM: number;
  heightMM: number;
  normal?: {
    margin: number;
    lengthMM: number;
  };
  customPoints?: IPoint[];
}) {
  const pb = new PointBuilder();
  const size = glueMapper(widthMM, heightMM);

  const pts = normal
    ? pb
        .draw(-size, normal.margin)
        .up(normal.lengthMM - normal.margin * 2)
        .draw(size, normal.margin)
        .build()
    : customPoints;

  const glue = addLine(pts, false);

  return { model: glue, size };
}
