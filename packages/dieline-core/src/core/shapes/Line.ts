import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";

export class Line implements IModel {
  models?: M.IModelMap | undefined;

  constructor(length: number, origin?: IPoint, angle?: number) {
    if (angle && (angle > 180 || angle < -180))
      throw new Error("Angle not allowed. -180 > angle < 180 . [Line Class]");

    const arc = new M.paths.Arc(origin ?? zero, length, 0, angle ?? 0);
    const arcPoints = M.point.fromArc(arc);
    const line = new M.paths.Line([origin ?? zero, arcPoints[1]!]);

    this.models = {
      line: {
        paths: { line },
      },
    };
  }
}
