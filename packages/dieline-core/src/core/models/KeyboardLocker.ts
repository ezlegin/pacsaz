import { IModelMap } from "makerjs";
import { Model } from "./model";

export class KeyboardLocker extends Model {
  constructor() {
    super();

    this.$pushModel("glue", this.trim());
  }

  protected override trim(): IModelMap {
    const glue = {};

    return { glue };
  }
}
