import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import { Shape } from "./shape";

export class Line extends Shape {
  constructor(length: number, angle?: number) {
    super();

    const arc = new M.paths.Arc(zero, length, 0, angle ?? 0);
    const arcPoints = M.point.fromArc(arc);
    // const line = new M.models.ConnectTheDots(false, [zero, arcPoints[1]!]);
    const line = new M.paths.Line([zero, arcPoints[1]!]);

    this.$pushShape("line", { paths: { line } });
  }
}

interface LineChainOption {
  closed?: boolean;
}

/**
 * Geometry only. Effects (radius / radiusAt / array) are applied by the Drawer
 * after the shape is built, so they are not handled here.
 */
export class Lines extends Shape {
  constructor(points: IPoint[], options?: LineChainOption) {
    super();

    const lines: IModel = new M.models.ConnectTheDots(
      options?.closed ?? false,
      points,
    );

    // this is used by mirror function to calculate the origin point.
    M.model.originate(lines, points[0]!);

    this.$pushShape("lines", lines);
  }
}
