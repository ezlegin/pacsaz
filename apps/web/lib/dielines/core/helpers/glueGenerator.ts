import M, { IPoint } from "makerjs";
import { PointBuilder } from "../helpers/pointBuilder";

export function addGlue({
  customPoints = [
    [0, 0],
    [100, 100],
  ],
  normal,
}: {
  normal?: {
    size: number;
    margin: number;
    lengthMM: number;
  };
  customPoints?: IPoint[];
}) {
  const pb = new PointBuilder();
  const pts = normal
    ? pb
        .draw(-normal.size, normal.margin)
        .up(normal.lengthMM - normal.margin * 2)
        .draw(normal.size, normal.margin)
        .build()
    : customPoints;

  return new M.models.ConnectTheDots(false, pts);
}
