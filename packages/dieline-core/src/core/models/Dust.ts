import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class Dust extends Model {
  constructor(
    private doorSize: number,
    private considerDustHole: boolean,
    private considerOuterIndent: boolean,
  ) {
    super();

    this.$pushModel("dust", this.trim(), this.fold());
  }

  protected override trim(): M.IModelMap {
    const dustSize = this.doorSize / 2;
    const mappedDustSize =
      this.width <= dustSize * 2 ? this.height / 2 : dustSize;

    const dustHeight = {
      r: {
        inner: 9,
        outer: 6,
      },
    };
    const indent = {
      bl: this.thickness + 3,
      tl: this.thickness < 1.6 ? 1 : 2,
      tr: 5,
      br: 3,
    };

    const arcStartPoint = [this.thickness, 0];
    const endAngle = this.thickness <= 2 ? (this.thickness < 1 ? -30 : -15) : 0;

    const arcModel = new Pacsaz.shapes.Arc(this.thickness, 180, endAngle).move(
      arcStartPoint,
    );

    const bottomLeftIndent = this.considerDustHole
      ? Math.max(0, indent.bl - arcModel.size.width)
      : indent.bl;

    const verticalMoveToTop = this.considerDustHole
      ? mappedDustSize - indent.bl
      : mappedDustSize - indent.bl;

    const baseToHoleEndOffset =
      this.thickness - Math.abs(arcModel.points.end[1]!);

    const dustStartPoint = this.considerDustHole
      ? arcModel.points.end
      : [0, -this.thickness];

    const pb = new Pacsaz.point.Builder(dustStartPoint);
    const dust = new Pacsaz.shapes.Lines(
      pb
        .draw(
          bottomLeftIndent,
          this.considerDustHole ? indent.bl - baseToHoleEndOffset : indent.bl,
        )
        .draw(indent.tl, verticalMoveToTop)
        .right(
          this.height -
            indent.br -
            bottomLeftIndent -
            indent.tl -
            indent.tr -
            (this.considerDustHole ? arcModel.size.width : 0) -
            (this.considerOuterIndent ? this.thickness : 0),
        )
        .draw(indent.tr, -mappedDustSize + dustHeight.r.inner)
        .draw(indent.br, -(dustHeight.r.inner - dustHeight.r.outer))
        .down(dustHeight.r.outer)
        .right(this.considerOuterIndent ? this.thickness : 0)
        .build(),
      {
        filletRadius: 10,
        indices: [3],
      },
    );

    const trim: IModel = {
      models: { dust },
    };
    if (this.considerDustHole) trim.models!["arc"] = arcModel;

    return { trim };
  }

  protected override fold() {
    const point1 = [0, -this.thickness];
    const point2 = [this.height, -this.thickness];

    const fold = new Pacsaz.shapes.Lines([
      this.considerDustHole ? [this.thickness, -this.thickness] : point1,
      [
        point2[0]! - (this.considerOuterIndent ? this.thickness : 0),
        point2[1]!,
      ],
    ]);

    return { fold };
  }
}
