import { ISpec } from "@repo/store/types";
import M from "makerjs";
import { Shape } from "./Shape";
import { addFillet, addFilletAt } from "../helpers/addFillet";

interface Options {
  deleteSide?: ISpec.Direction;
  radius?: number;
  effects?: ISpec.ShapeEffect[];
}

export class Rectangle extends Shape {
  constructor(width: number, height: number, options?: Options) {
    super();
    const rect = new M.models.Rectangle(width, height);

    switch (options?.deleteSide) {
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

    if (options?.effects) {
      for (const effect of options.effects) {
        switch (effect.type) {
          case "radiusAt": {
            const rounded = addFilletAt(
              rect,
              effect.targets.map((t) => +t),
              +effect.value,
            );
            this.$pushShape("rect", rounded);
            return;
          }
          case "radius": {
            const rounded = addFillet(rect, +effect.value);
            this.$pushShape("rect", rounded);
            return;
          }
        }
      }
    }

    this.$pushShape("rect", rect);
  }
}
