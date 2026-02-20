import { zero } from "../../data/consts";
import { Shape } from "./Shape";
import M, { IPathArc, IPoint } from "makerjs";

export class Arc extends Shape {
  constructor(
    private radius: number,
    private startAngle: number,
    private endAngle: number,
  ) {
    super();

    const arc = new M.paths.Arc(
      zero,
      this.radius,
      this.startAngle,
      this.endAngle,
    );

    this.$pushShape("arc", { paths: { arc }, origin: zero });
  }

  get points(): { start: IPoint; end: IPoint } {
    const arcPath = this.lastModel?.paths?.arc!;
    const cloned = M.path.clone(arcPath) as IPathArc;
    cloned.origin = this.lastModel?.origin ?? zero;
    const points = M.point.fromArc(cloned);
    return { start: points[0]!, end: points[1]! };
  }
}
