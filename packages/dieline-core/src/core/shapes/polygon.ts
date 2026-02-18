import M from "makerjs";
import { Shape } from "./Shape";

export class Polygon extends Shape {
  constructor(radius: number, sides: number = 5, firstCornerAngle?: number) {
    super();

    const polygon = new M.models.Polygon(sides, radius, firstCornerAngle ?? 90);
    this.$addToModel(polygon, "polygon");
  }
}
