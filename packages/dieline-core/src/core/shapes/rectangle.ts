import { ISpec } from "@repo/store/types";
import M from "makerjs";
import { addFillet, addFilletAt } from "../helpers/addFillet";
import { Shape } from "./Shape";

interface Options {
  deleteSide?: ISpec.Direction;
  effects?: ISpec.ShapeEffect[];
}

export class Rectangle extends Shape {
  constructor(width: number, height: number, options?: Options) {
    super();

    const rect = new M.models.Rectangle(width, height);
    this.$applyDeleteSide(rect, options?.deleteSide);

    let model: M.IModel = rect;

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

    this.$pushShape("rect", model);
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
