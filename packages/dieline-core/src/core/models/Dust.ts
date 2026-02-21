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

    // Dust hole geometry measurements
    const { disOfHeight: dustHoleOuterHeight, disOfWidth: dustHoleWidth } =
      getDistanceOfFirstAndLastPoint(this.arc, "path");

    // Indent calculations (bottom-left)
    const bottomLeftIndent = this.considerDustHole
      ? Math.max(0, indent.bl - dustHoleWidth)
      : indent.bl;

    // Vertical movement calculation
    const verticalMoveToTop = this.considerDustHole
      ? mappedDustSize - indent.bl
      : mappedDustSize - indent.bl;

    // Base-to-hole vertical compensation
    const baseToHoleEndOffset = this.safeFoldOffset - dustHoleOuterHeight;

    const dustStartPoint = this.considerDustHole
      ? getLastPointFromPath(this.arc)
      : [0, -this.safeFoldOffset];

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
    const Y = [this.height, -this.safeFoldOffset];
    const X = [0, -this.safeFoldOffset];

    const temp = new M.paths.Line([X, Y]);

    const { intersectionPoints } = M.path.intersection(this.arc, temp);

    const fold = new Pacsaz.shapes.Lines([
      this.considerDustHole ? intersectionPoints[1]! : X,
      [Y[0]! - this.thickness, Y[1]!],
    ]);

    return { fold };
  }

  // ──────────────────── ARC ────────────────────
  private get arc(): IPath {
    const { holeRadius, endAngle } = this.$calculateDustHoleSize(
      this.safeFoldOffset,
    );

    const arcStartPoint: [number, number] = [holeRadius, 0];

    const arc = new M.paths.Arc(arcStartPoint, holeRadius, 180, endAngle);

    return arc;
  }

  // ──────────────────── Utils ────────────────────

  private $calculateDustHoleSize(safeFoldOffset: number) {
    const addLineToHole = safeFoldOffset < 2;
    const endAngleThreshold = safeFoldOffset < 1;
    const endAngle = addLineToHole ? (endAngleThreshold ? -30 : -15) : 0;
    return {
      addLineToHole,
      endAngle,
      holeRadius: (safeFoldOffset * 3) / 2, // to /2 BECUASE IT IS RADUIS
    };
  }
}
