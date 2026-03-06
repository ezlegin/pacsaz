import M from "makerjs";
import { Shape } from "./Shape";

export class Polygon extends Shape {
  constructor(radius: number, sides: number = 5) {
    super();

    const polygon = new M.models.Polygon(sides, radius, 90);
    this.$pushShape("polygon", polygon);
  }
}
