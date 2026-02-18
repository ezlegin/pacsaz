import { Dieline } from "../../core/dieline/Dieline";
import Pacsaz from "../../core/Pacsaz";

export class Dev extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  protected override trim() {
    // const glue = new Pacsaz.models.Glue();
    // const door = new Pacsaz.models.Door().moveTo([
    //   0,
    //   this.length + this.safeFoldOffset,
    // ]);
    // const dust = new Pacsaz.models.Dust(door.size.height, true, true).moveTo([
    //   this.width,
    //   this.length + this.safeFoldOffset,
    // ]);

    const s1 = new Pacsaz.shapes.Line(this.width, [
      this.width + this.height,
      this.length,
    ]);
    const s2 = new Pacsaz.shapes.Line(this.width);
    const s3 = new Pacsaz.shapes.Line(
      this.length,
      [this.width * 2 + this.height * 2, 0],
      90,
    );

    const line = new Pacsaz.shapes.Line(15, [10, 30], 45)
      .dup()
      .mirror(true, true);

    console.log("line", line);

    // this.$pushModels({ door, dust });
    this.$pushShapes({ s1, s2, s3, line }, "trimModel");
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

  protected override dielineRuler(): MakerJs.IModel {
    return {};
  }
}

export default new Dev();
