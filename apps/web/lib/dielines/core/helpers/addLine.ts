import M from "makerjs";
import { addFillet } from "./addFillet";

export function addLine(
  pts: M.IPoint[],
  closed?: boolean,
  filletRaduis?: number
) {
  const drawnLine = new M.models.ConnectTheDots(closed ?? false, pts);

  addFillet(drawnLine, filletRaduis);

  return drawnLine;
}
