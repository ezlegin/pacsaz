import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import { addFillet, addFilletAt } from "../helpers/add/addFillet";
import { Shape } from "./shape";

export class LineChain extends Shape {
  constructor(
    pts: M.IPoint[],
    closed?: boolean,
    filletRaduis?: number,
    indices?: number[],
  ) {
    super();

    let line: IModel = new M.models.ConnectTheDots(closed ?? false, pts);

    if (indices) {
      line = addFilletAt(line, indices, filletRaduis);
    } else {
      const fillet = addFillet(line, filletRaduis);
      if (fillet) line = fillet;
    }

    this.$registerModel("line", line);
  }
}

export class Line extends Shape {
  constructor(length: number, origin?: IPoint, angle?: number) {
    super();
    if (angle && (angle > 180 || angle < -180))
      throw new Error("Angle should be: -180 > angle < 180 . [Line Class]");

    const arc = new M.paths.Arc(origin ?? zero, length, 0, angle ?? 0);
    const arcPoints = M.point.fromArc(arc);
    const line = new M.models.ConnectTheDots(false, [
      origin ?? zero,
      arcPoints[1]!,
    ]);

    this.$registerModel("line", line);
  }
}
