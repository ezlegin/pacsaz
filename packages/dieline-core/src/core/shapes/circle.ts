import M, { IModel, IPoint } from "makerjs";
import { Shape } from "./Shape";
import { zero } from "../../data/consts";

export class Circle extends Shape {
  constructor(radius: number, origin?: IPoint) {
    super();
    const circle = new M.paths.Circle(radius);
    const model: IModel = { paths: { circle } };
    if (origin) M.model.move(model, origin);
    this.$pushShape("circle", model);
  }

  override mirror(): this {
    throw new Error(
      "Mirror function is nonesense for circle. If you want to mirror it, just duplicate it and move to the opposite direction.",
    );
  }
}

export class SemiCircle extends Shape {
  constructor(radius: number, side?: "left" | "right" | "up" | "down") {
    super();

    let startAngle = 180;
    let endAngle = 360;

    switch (side) {
      case "up":
        startAngle = 0;
        endAngle = 180;
        break;
      case "left":
        startAngle = 90;
        endAngle = 270;
        break;
      case "right":
        startAngle = 270;
        endAngle = 90;
        break;
    }

    const semiCircle = new M.paths.Arc(zero, radius, startAngle, endAngle);
    const model: IModel = { paths: { semiCircle }, origin: zero };

    this.$pushShape("semi-circle", model);
  }
}
