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

    this.$pushModel(this.trim(), this.fold());
  }

  private trim() {
    const doorLine = new Pacsaz.shapes.LineChain(
      [],
      (pb) =>
        pb
          .up(this.topPanelHeight)
          .right(this.thickness)
          .up(this.tuckFlap.h)
          .right(this.tuckFlap.w)
          .down(this.tuckFlap.h)
          .right(this.thickness)
          .down(this.topPanelHeight),
      {
        filletRaduis: 20,
      },
    );

    const seam = new Pacsaz.shapes.LineChain(
      [],
      (pb) => pb.right(this.seamSize.w).down(this.seamSize.h),
      {
        filletRaduis: 2,
        startPoint: [this.tuckFlap.indent, this.topPanelHeight],
      },
    )
      .dup()
      .mirror(true, false)
      .moveTo([this.tuckFlap.w, 0]);

    return { doorLine, seam };
  }

  private fold() {
    const tuckFlapFold = new Pacsaz.shapes.Line(
      this.width - this.seamSize.w * 2 - this.thickness * 2,
      [
        this.thickness + this.seamSize.w,
        this.topPanelHeight - this.fingerSpace,
      ],
    );

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
