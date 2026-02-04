import M, { IPoint } from "makerjs";

export class Measure {
  static distOfPoints(a: IPoint, b: IPoint): number {
    return +M.measure.pointDistance(a, b).toFixed(1);
  }
}
