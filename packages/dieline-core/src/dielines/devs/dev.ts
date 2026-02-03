import { IModel } from "makerjs";
import Pacsaz from "../../core/Pacsaz";
import { Dieline } from "../../core/dieline/Dieline";

export class Dev extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 130,
    length: 230,
    height: 0,
  };

  protected override trim(): IModel {
    const rect = new Pacsaz.shapes.Rectangle(this.width * 2, this.length);

    return { models: { rect } };
  }

  protected override fold(): IModel {
    const centerFold = new Pacsaz.shapes.Line(this.length, [this.width, 0], 90);
    return { models: { centerFold } };
  }
}

export default new Dev();
