import { calcualteTuckFlapSize } from "../../utils/calculate/calculateTuckFlapSize";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class Door extends Model {
  constructor() {
    super();

    // ─────────────────────────────────────────
    // Top door panel
    // ─────────────────────────────────────────

    const tuckFlapSize = calcualteTuckFlapSize(this.width);

    const doorLine = new Pacsaz.shapes.LineChain(
      [],
      (pb) =>
        pb
          .up(this.height)
          .right(this.thickness)
          .up(tuckFlapSize)
          .right(this.width - this.thickness * 2)
          .down(tuckFlapSize)
          .right(this.thickness)
          .down(this.height),
      {
        filletRaduis: 25,
      },
    );

    // ─────────────────────────────────────────
    // Seam
    // ─────────────────────────────────────────
    const seamSize = {
      w: 8,
      h: 1.5,
    };

    const seamHeight = Math.max(this.thickness * 2, seamSize.h);

    const seam = new Pacsaz.shapes.LineChain(
      [],
      (pb) => pb.right(seamSize.w).down(seamHeight),
      {
        filletRaduis: 2,
        startPoint: [this.thickness, this.height],
      },
    )
      .duplicate()
      .mirror(true, false)
      .move([this.width - this.thickness * 2, 0]);

    // ─────────────────────────────────────────
    // Fold Lines
    // ─────────────────────────────────────────
    const foldY = this.height - this.thickness;

    const tuckFlapFold = new Pacsaz.shapes.Line(
      this.width - seamSize.w * 2 - this.thickness * 2,
      [this.thickness + seamSize.w, foldY],
    );

    const doorFold = new Pacsaz.shapes.Line(this.width, [
      0,
      this.safeFoldOffset,
    ]);

    this.$pushModel({ doorLine, seam }, { doorFold, tuckFlapFold });
  }
}
