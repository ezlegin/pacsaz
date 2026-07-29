import M, { IModel } from "makerjs";
import { zero } from "../../data/consts";
import { Shape } from "./Shape";

export class Ellipse extends Shape {
  constructor(id: string, radiusX: number, radiusY: number) {
    super(id);
    const ellipse = new M.models.Ellipse(radiusX, radiusY);
    this.$pushShape("circle", ellipse);
  }

  override mirror(): this {
    throw new Error(
      "Mirror function is nonesense for ellipse. If you want to mirror it, just duplicate it and move to the opposite direction.",
    );
  }
}

export class SemiCircle extends Shape {
  constructor(
    id: string,
    radius: number,
    side?: "left" | "right" | "up" | "down",
  ) {
    super(id);

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
