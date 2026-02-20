import M, { IModel } from "makerjs";
import { Shape } from "./Shape";
import { zero } from "../../data/consts";

export class ToShape extends Shape {
  constructor(model: IModel) {
    super();
    M.model.originate(model, zero);
    this.$pushShape("model", model);
  }
}
