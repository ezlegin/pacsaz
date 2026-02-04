import { IModel } from "makerjs";
import { Dieline } from "../../core/dieline/Dieline";
import { Door } from "../../core/models/Door";
import Pacsaz from "../../core/Pacsaz";

export class Dev extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 130,
    length: 230,
    height: 90,
  };

  protected override trim() {
    const line = new Pacsaz.models.Glue(this.width, this.length, this.height);
    const door = new Door().move([0, this.length]);

    this.$pushDielineModels({ door });
    Pacsaz.shape.push(this.trimModel, "trim", line);
  }

  protected override dielineRuler(): IModel {
    return {};
  }
}

export default new Dev();
