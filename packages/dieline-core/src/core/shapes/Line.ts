import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import { Shape } from "./Shape";

export class Line extends Shape {
  constructor(length: number, angle?: number) {
    super();

    const arc = new M.paths.Arc(zero, length, 0, angle ?? 0);
    const arcPoints = M.point.fromArc(arc);
    const line = new M.models.ConnectTheDots(false, [zero, arcPoints[1]!]);

    this.$pushShape("line", line);
  }
}

interface LineChainOption {
  closed?: boolean;
}

export class Lines extends Shape {
  constructor(points: IPoint[], options?: LineChainOption) {
    super();

    let line: IModel = new M.models.ConnectTheDots(
      options?.closed ?? false,
      points,
    );

    // this is used by mirror function to calculate the origin point.
    M.model.originate(line, points[0]!);

    this.$pushShape("line", line);
  }
}
