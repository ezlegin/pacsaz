import M from "makerjs";
import { addFillet, addFilletAt } from "./addFillet";

export function addLine(
  pts: M.IPoint[],
  closed?: boolean,
  filletRaduis?: number,
  indices?: number[],
) {
  const drawnLine = new M.models.ConnectTheDots(closed ?? false, pts);

  if (indices) {
    addFilletAt(drawnLine, indices, filletRaduis);
  } else {
    addFillet(drawnLine, filletRaduis);
  }

  return drawnLine;
}
