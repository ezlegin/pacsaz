import { calcualteTuckFlapSize } from "../../utils/calculate/calculateTuckFlapSize";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class Door extends Model {
  fingerSpace = this.seamSize.h / 2;
  tuckFlap = {
    indent: this.thickness,
    w: this.width - this.thickness * 2,
    h: calcualteTuckFlapSize(this.width) - this.fingerSpace,
  };
  topPanelHeight = this.height;

  constructor() {
    super();

    this.$pushModel("door", this.trim(), this.fold());
  }

  protected override trim() {
    const pb = new Pacsaz.point.Builder();
    const doorLine = new Pacsaz.shapes.Lines(
      pb
        .up(this.topPanelHeight)
        .right(this.thickness)
        .up(this.tuckFlap.h)
        .right(this.tuckFlap.w)
        .down(this.tuckFlap.h)
        .right(this.thickness)
        .down(this.topPanelHeight)
        .build(),
      { filletRadius: 20 },
    );

    const seam_pb = new Pacsaz.point.Builder([
      this.tuckFlap.indent,
      this.topPanelHeight,
    ]);
    const seam = new Pacsaz.shapes.Lines(
      seam_pb.right(this.seamSize.w).down(this.seamSize.h).build(),
      {
        filletRadius: 2,
      },
    )
      .dup()
      .mirror(true, false, "left")
      .move([this.tuckFlap.w, 0]);

    return { doorLine, seam };
  }

  protected override fold() {
    const tuckFlapFold = new Pacsaz.shapes.Line(
      this.width - this.seamSize.w * 2 - this.thickness * 2,
    ).move([
      this.thickness + this.seamSize.w,
      this.topPanelHeight - this.fingerSpace,
    ]);

    const doorFold = new Pacsaz.shapes.Line(this.width);

    return { doorFold, tuckFlapFold };
  }

  get seamSize() {
    return {
      w: 8,
      h: this.thickness * 2,
    };
  }
}
