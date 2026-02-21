import { Dieline } from "../../core/dieline/Dieline";
import Pacsaz from "../../core/Pacsaz";

class Dev extends Dieline {
  override slug = "dev";
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  protected override trim() {
    const glue = new Pacsaz.models.Glue(
      [0, this.safeFoldOffset / 2],
      [0, this.length],
    );
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

    const snapLock = new Pacsaz.models.SnapLock();

    const s1 = new Pacsaz.shapes.Line(this.width).move([
      this.width + this.height,
      this.length,
    ]);
    const s2 = new Pacsaz.shapes.Line(this.length, 90).move([
      this.width * 2 + this.height * 2,
      0,
    ]);
    const s3 = new Pacsaz.shapes.Line(this.safeFoldOffset, 90).move([
      0,
      this.length,
    ]);

    const s4 = new Pacsaz.shapes.Lines(
      [
        [-30, -30],
        [-20, -20],
        [-20, -30],
      ],
      { closed: true },
    );

    this.$pushModels({ glue, door, dust, dust2, lock: snapLock });
    this.$pushShapes({ s1, s2, s3, s4 }, "trimModel");
  }

  protected override fold(): void {
    const snapLockOffsetFromBase = this.safeFoldOffset / 2;

    const foldsHeight = this.length - snapLockOffsetFromBase;
    const fold1 = new Pacsaz.shapes.Line(foldsHeight, 90).move([
      0,
      snapLockOffsetFromBase,
    ]);
    const fold2 = new Pacsaz.shapes.Line(
      foldsHeight + this.safeFoldOffset,
      90,
    ).move([this.width, snapLockOffsetFromBase]);
    const fold3 = new Pacsaz.shapes.Line(foldsHeight, 90).move([
      this.width + this.height,
      snapLockOffsetFromBase,
    ]);
    const fold4 = new Pacsaz.shapes.Line(foldsHeight, 90).move([
      this.width * 2 + this.height,
      snapLockOffsetFromBase,
    ]);

    this.$pushShapes({ fold1, fold2, fold3, fold4 }, "foldModel");
  }
}

export default new Dev();
