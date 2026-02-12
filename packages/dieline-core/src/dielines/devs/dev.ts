import { Dieline } from "../../core/dieline/Dieline";
import { Door } from "../../core/models/Door";
import { Dust } from "../../core/models/Dust";
import Pacsaz from "../../core/Pacsaz";

export class Dev extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  protected override trim() {
    const line = new Pacsaz.models.Glue();
    const door = new Door().move([0, this.length + this.safeFoldOffset]);

    const dust = new Dust(door.size.height, true, true).move([
      this.width,
      this.length + this.safeFoldOffset,
    ]);

    const s1 = new Pacsaz.shapes.Line(this.width, [
      this.width + this.height,
      this.length,
    ]);

    const s2 = new Pacsaz.shapes.Line(this.width);

    this.$pushDielineModels({ door, dust });
    Pacsaz.shape.push(this.trimModel, "trim", [line, s1, s2]);
  }

  protected override fold(): void {
    const f1 = new Pacsaz.shapes.Line(this.length, [0, 0], 90);
    const f2 = new Pacsaz.shapes.Line(this.length, [this.width, 0], 90);
    const f3 = new Pacsaz.shapes.Line(
      this.length,
      [this.width + this.height, 0],
      90,
    );
    const f4 = new Pacsaz.shapes.Line(
      this.length,
      [this.width * 2 + this.height, 0],
      90,
    );
    Pacsaz.shape.push(this.foldModel, "fold", [f1, f2, f3, f4]);
  }

  // protected override dielineRuler(): IModel {
  //   return {};
  // }
}

export default new Dev();
