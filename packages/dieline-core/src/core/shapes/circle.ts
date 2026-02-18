import M, { IModel, IPoint } from "makerjs";
import { Shape } from "./Shape";
import { zero } from "../../data/consts";

export class Circle extends Shape {
  constructor(radius: number, origin?: IPoint) {
    super();
    const circle = new M.paths.Circle(radius);
    const model: IModel = { paths: { circle } };
    if (origin) M.model.move(model, origin);
    this.$addToModel(model, "circle");
  }

  override mirror(): this {
    throw new Error(
      "Mirror function is nonesense for circle. If you want to mirror it, just duplicate it and move to the opposite direction.",
    );
  }
}

export class SemiCircle extends Shape {
  constructor(radius: number, side?: "left" | "right" | "top" | "bottom") {
    super();

    let startAngle = 0;
    let endAngle = 180;

    switch (side) {
      case "bottom":
        startAngle = 180;
        endAngle = 360;
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

    this.$addToModel(model, "semi-circle");
  }
}
