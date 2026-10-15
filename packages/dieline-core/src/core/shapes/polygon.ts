import M from "makerjs";
import { Shape } from "./shape";

/**
 * Geometry only. Effects (radius / radiusAt / array) are applied by the Drawer
 * after the shape is built, so they are not handled here.
 */
export class Polygon extends Shape {
  constructor(radius: number, sides: number = 5, firstCornerAngle?: number) {
    super();

    const polygon = new M.models.Polygon(sides, radius, firstCornerAngle ?? 90);

    this.$pushShape("polygon", polygon);
  }
}
