import { IPoint } from "makerjs";
import { Ruler } from "./Ruler";
import Pacsaz from "../Pacsaz";

export class CustomRuler extends Ruler {
  constructor(
    private from: IPoint,
    private to: IPoint,
    private value: number,
  ) {
    super();

    const lengthRuler = this.ruler(this.from, this.to, this.value);

    Pacsaz.shape.push(this, "dielineRuler", {
      models: { lengthRuler },
    });
  }
}
