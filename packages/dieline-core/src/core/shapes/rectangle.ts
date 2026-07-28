import M from "makerjs";
import { Shape } from "./Shape";
import { ISpec } from "@repo/store/types";

interface Options {
  deleteSide?: ISpec.Direction;
  radius?: number;
}

export class Rectangle extends Shape {
  constructor(id: string, width: number, height: number, options?: Options) {
    super(id);
    const rect = new M.models.Rectangle(width, height);

    switch (options?.deleteSide) {
      case "down":
        delete rect.paths?.["Bottom"];
        break;
      case "left":
        delete rect.paths?.["Left"];
        break;
      case "right":
        delete rect.paths?.["Right"];
        break;
      case "up":
        delete rect.paths?.["Top"];
        break;
    }

    this.$pushShape("rectangle", rect);
  }
}

//todo: When having radius and delete a side, issues come to picture. sovle it.
