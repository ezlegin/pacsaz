import { ISpec } from "@repo/store/types";
import M from "makerjs";
import { Shape } from "./Shape";

interface Options {
  deleteSide?: ISpec.Direction;
}

/**
 * Geometry only. Effects (radius / radiusAt / array) are applied by the Drawer
 * after the shape is built, so they are not handled here.
 */
export class Rectangle extends Shape {
  constructor(width: number, height: number, options?: Options) {
    super();

    const rect = new M.models.Rectangle(width, height);
    this.$applyDeleteSide(rect, options?.deleteSide);

    this.$pushShape("rect", rect);
  }

  private $applyDeleteSide(rect: M.models.Rectangle, side?: ISpec.Direction) {
    switch (side) {
      case "down":
        delete rect.paths?.["ShapeLine1"];
        break;
      case "left":
        delete rect.paths?.["ShapeLine4"];
        break;
      case "right":
        delete rect.paths?.["ShapeLine2"];
        break;
      case "up":
        delete rect.paths?.["ShapeLine3"];
        break;
    }
  }
}
