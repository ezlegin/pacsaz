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

    let model: M.IModel = polygon;

    for (const effect of options?.effects ?? []) {
      switch (effect.type) {
        case "radiusAt":
          model = addFilletAt(
            model,
            effect.targets.map((t) => +t),
            +effect.value,
          );
          break;

        case "radius":
          model = addFillet(model, +effect.value);
          break;

        case "array":
          model = this.$applyArray(model, effect);
          break;
      }
    }

    this.$pushShape("polygon", model);
  }
}
