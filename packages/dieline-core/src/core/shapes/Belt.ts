import M from "makerjs";
import { Shape } from "./shape";

/**
 * Geometry only. Effects (radius / radiusAt / customRadiusAt / fullRadius /
 * array) are applied by the Drawer after the shape is built.
 *
 * makerjs builds the belt as two circular ends joined by their tangent edges,
 * lying **horizontally** and centred on the left circle. `angle` rotates it about
 * that centre; the Drawer defaults it to 90°, so a belt is vertical unless asked
 * otherwise.
 */
export class Belt extends Shape {
  constructor(
    leftRadius: number,
    distance: number,
    rightRadius: number,
    angle: number = 90,
  ) {
    super();

    const belt: M.IModel = new M.models.Belt(
      leftRadius,
      distance,
      rightRadius,
    );

    if (angle) M.model.rotate(belt, angle, [0, 0]);

    this.$pushShape("belt", belt);
  }
}
