import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";

export class DielineRuler extends Ruler implements IModel {
  models?: M.IModelMap | undefined;

  constructor(
    private width: number,
    private length: number,
  ) {
    super();

    const lengthRuler = this.ruler(
      [this.width / 4, 0],
      [this.width / 4, this.length],
      this.length,
    );

    const widthRuler = this.ruler(
      [0, this.length / 4],
      [this.width, this.length / 4],
      this.width,
    );

    Pacsaz.shape.push(
      this,
      "dielineRuler",
      { models: { lengthRuler, widthRuler } },
      "dielineRuler",
    );
  }
}
