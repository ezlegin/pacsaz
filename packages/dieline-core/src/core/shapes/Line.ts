import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import { addFillet, addFilletAt } from "../helpers/add/addFillet";
import { PointBuilder } from "../utils/PointBuilder";
import { Shape } from "./Shape";

interface LineChainOption {
  closed?: boolean;
  filletRaduis?: number;
  indices?: number[];
  startPoint?: IPoint;
}

export class LineChain extends Shape {
  constructor(
    points: IPoint[],
    buildPoints?: (pb: PointBuilder) => void,
    options?: LineChainOption,
  ) {
    super();

    const pb = new PointBuilder(options?.startPoint);
    if (buildPoints) buildPoints(pb);
    const pts = pb.build();

    let line: IModel = new M.models.ConnectTheDots(
      options?.closed ?? false,
      buildPoints ? pts : points,
    );

    if (options?.indices) {
      line = addFilletAt(line, options.indices, options.filletRaduis);
    } else {
      addFillet(line, options?.filletRaduis);
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
