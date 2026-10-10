import M from "makerjs";
import { Shape } from "./Shape";
import { ISpec } from "@repo/store/types";
import { addFillet, addFilletAt } from "../helpers/addFillet";

export class Polygon extends Shape {
  constructor(
    radius: number,
    sides: number = 5,
    firstCornerAngle?: number,
    options?: { effects?: ISpec.ShapeEffect[] },
  ) {
    super();

    const polygon = new M.models.Polygon(sides, radius, firstCornerAngle ?? 90);

    if (options?.effects) {
      for (const effect of options.effects) {
        switch (effect.type) {
          case "radiusAt": {
            const rounded = addFilletAt(
              polygon,
              effect.targets.map((t) => +t),
              +effect.value,
            );
            this.$pushShape("polygon", rounded);
            return;
          }
          case "radius": {
            const rounded = addFillet(polygon, +effect.value);
            this.$pushShape("polygon", rounded);
            return;
          }
        }
      }
    }

    this.$pushShape("polygon", polygon);
  }
}
