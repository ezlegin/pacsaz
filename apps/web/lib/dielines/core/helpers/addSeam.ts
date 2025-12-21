import M from "makerjs";
import { addLine } from "./addLine";

export function addSeam(
  pts: M.IPoint[],
  closed?: boolean,
  filletRaduis?: number
) {
  const drawnSeam = addLine(pts, closed, filletRaduis);

  return drawnSeam;
}
