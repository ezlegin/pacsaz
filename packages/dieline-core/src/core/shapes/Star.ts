import M from "makerjs";
import { Shape } from "./shape";

/**
 * Geometry only. Effects (radius / radiusAt / customRadiusAt / fullRadius /
 * array) are applied by the Drawer after the shape is built, so they are not
 * handled here.
 */
export class Star extends Shape {
  constructor(
    points: number,
    radius: number,
    innerRadius?: number,
    skipPoints?: number,
  ) {
    super();

    // makerjs derives a pleasing inner radius from the point count when one is
    // not supplied, so only pass it when it is a real value.
    const star = new M.models.Star(
      points,
      radius,
      innerRadius && innerRadius > 0 ? innerRadius : undefined,
      skipPoints,
    );

    this.$pushShape("star", star);
  }
}
