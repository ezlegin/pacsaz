import M from "makerjs";
import { Side } from "../../data/core.types";
import { Shape } from "./Shape";

interface Options {
  deleteSide?: Side;
  radius?: number;
}

export class Rectangle extends Shape {
  constructor(width: number, height: number, options?: Options) {
    super();
    const rect = new M.models.RoundRectangle(
      width,
      height,
      options?.radius ?? 0,
    );

    if (options?.deleteSide) {
      if (options?.deleteSide) delete rect.paths?.[options?.deleteSide];
    }

    this.$addToModel(rect, "rectangle");
  }
}

//todo: When having radius and delete a side, issues come to picture. sovle it.
