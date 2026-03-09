import M, { IModel, IPath } from "makerjs";
import { getDistanceOfFirstAndLastPoint } from "../helpers/getDistance";
import { getLastPointFromPath } from "../helpers/getLastPoint";
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

    const { disOfHeight: dustHoleOuterHeight, disOfWidth: dustHoleWidth } =
      getDistanceOfFirstAndLastPoint(this.arc, "path");

    const bottomLeftIndent = this.considerDustHole
      ? Math.max(0, indent.bl - dustHoleWidth)
      : indent.bl;

    const verticalMoveToTop = this.considerDustHole
      ? mappedDustSize - indent.bl
      : mappedDustSize - indent.bl;

    const baseToHoleEndOffset = this.thickness - dustHoleOuterHeight;

    const dustStartPoint = this.considerDustHole
      ? getLastPointFromPath(this.arc)
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
            (this.considerDustHole ? dustHoleWidth : 0) -
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
    if (this.considerDustHole) trim.paths = { arc: this.arc };

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

  private get arc(): IPath {
    //todo
    const arcStartPoint = [this.thickness, 0];
    const endAngle = this.thickness <= 2 ? (this.thickness < 1 ? -30 : -15) : 0;

    const arc = new M.paths.Arc(arcStartPoint, this.thickness, 180, endAngle);

    return arc;
  }
}
