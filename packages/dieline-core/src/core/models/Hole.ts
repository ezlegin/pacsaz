import M, { IModelMap } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class Hole extends Model {
  constructor(
    private angleBetweenStartAndEnd: string,
    private heightOfLine: string,
    private rotation: string,
    private handleDir: "left" | "right",
  ) {
    super();

    this.$pushModel("glue", this.trim());
  }

  protected override trim(): IModelMap {
    const isRightHandle = this.handleDir === "right";
    const radius = this.thickness;
    const rot = +this.rotation;
    const betweenAngle = +this.angleBetweenStartAndEnd;
    const startAngle = -90;
    const computedCircleAngle = 90 - betweenAngle;
    const gap = Math.sin(M.angle.toRadians(betweenAngle)) * radius;
    const lineHeight = M.solvers.solveTriangleASA(
      90,
      +this.heightOfLine + gap,
      betweenAngle,
    );
    var radians = M.angle.toRadians(startAngle + rot);
    var x = Math.cos(radians) * radius;
    var y = Math.sin(radians) * radius;

    const arc = new Pacsaz.shapes.Arc(
      radius,
      (isRightHandle ? 180 - computedCircleAngle : startAngle) + rot,
      (isRightHandle ? startAngle : computedCircleAngle) + rot,
    ).move([-x, -y]);

    const line = new Pacsaz.shapes.Line(
      lineHeight,
      (isRightHandle ? betweenAngle : 180 - betweenAngle) + rot,
    ).move(isRightHandle ? arc.points.start : arc.points.end);

    return { arc, line };
  }
}
