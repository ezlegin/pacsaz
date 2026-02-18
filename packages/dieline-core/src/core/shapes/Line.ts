import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import { addFillet, addFilletAt } from "../helpers/add/addFillet";
import { Shape } from "./Shape";

export class Line extends Shape {
  constructor(length: number, origin?: IPoint, angle?: number) {
    super();
    if (angle && (angle > 180 || angle < -180))
      throw new Error("Angle should be: -180 > angle < 180 . [Line Class]");

    const arc = new M.paths.Arc(zero, length, 0, angle ?? 0);
    const arcPoints = M.point.fromArc(arc);
    const line = new M.models.ConnectTheDots(false, [zero, arcPoints[1]!]);
    M.model.move(line, origin ?? zero);

    this.$registerModel("line", line);
  }
}

interface LineChainOption {
  closed?: boolean;
  filletRadius?: number;
  indices?: number[];
}

export class Lines extends Shape {
  constructor(points: IPoint[], options?: LineChainOption) {
    super();

    let line: IModel = new M.models.ConnectTheDots(
      options?.closed ?? false,
      points,
    );

    if (options?.indices) {
      line = addFilletAt(line, options.indices, options.filletRadius);
    } else {
      addFillet(line, options?.filletRadius);
    }

    // this is used by mirror function to calculate the origin point.
    M.model.originate(line, points[0]!);

    this.$registerModel("line", line);
  }
}
