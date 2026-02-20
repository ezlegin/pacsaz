import { Dieline } from "../../core/dieline/Dieline";
import { Glue } from "../../core/models/Glue";
import { SnapLock } from "../../core/models/SnapLock";
import Pacsaz from "../../core/Pacsaz";

export class Dev extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  protected override trim() {
    const glue = new Glue([0, this.safeFoldOffset / 2], [0, this.length]); //todo
    const door = new Pacsaz.models.Door().moveTo([
      0,
      this.length + this.safeFoldOffset,
    ]);

    const dust = new Pacsaz.models.Dust(door.size.height, true, true).move([
      this.width,
      this.length + this.safeFoldOffset,
    ]);
    const dust2 = new Pacsaz.models.Dust(door.size.height, false, true)
      .mirror(true, false)
      .move([this.width * 2 + this.height, this.length + this.safeFoldOffset]);

    const s1 = new Pacsaz.shapes.Line(this.width).move([
      this.width + this.height,
      this.length,
    ]);
    const s3 = new Pacsaz.shapes.Line(this.length, 90).move([
      this.width * 2 + this.height * 2,
      0,
    ]);

    const snapLock = new SnapLock();

    this.$pushModels({ glue, door, dust, dust2, lock: snapLock });
    this.$pushShapes({ s1, s3 }, "trimModel");
  }

  protected override fold(): void {
    const fold1 = new Pacsaz.shapes.Line(this.length, 90);
    const fold2 = new Pacsaz.shapes.Line(this.length, 90).move([this.width, 0]);
    const fold3 = new Pacsaz.shapes.Line(this.length, 90).move([
      this.width + this.height,
      0,
    ]);
    const fold4 = new Pacsaz.shapes.Line(this.length, 90).move([
      this.width * 2 + this.height,
      0,
    ]);
    this.$pushShapes({ fold1, fold2, fold3, fold4 }, "foldModel");
  }
}

export default new Dev();
