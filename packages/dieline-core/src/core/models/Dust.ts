import M from "makerjs";
import { getDistanceOfFirstAndLastPoint } from "../helpers/getDistance";
import { getLastPointFromPath } from "../helpers/getLastPoint";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class Dust extends Model {
  constructor(
    doorSize: number,
    considerDustHole: boolean,
    considerOuterIndent: boolean,
  ) {
    super();
    this.$pushModel({}, {});

    this.safeFoldOffset;
    this.thickness;
    this.width;
    this.length;
    this.height;

    const dustSize = doorSize / 2;
    const mappedDustSize = this.$mapDustSize(this.width, dustSize, this.height);

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

    // ─────────────────────────────────────────
    // Dust Hole
    // ─────────────────────────────────────────
    const { holeRadius, endAngle } = this.$calculateDustHoleSize(
      this.safeFoldOffset,
    );

    const arcStartPoint: [number, number] = [holeRadius, 0];

    const arc = new M.paths.Arc(arcStartPoint, holeRadius, 180, endAngle);

    // ─────────────────────────────────────────
    // Dust part 1
    // ─────────────────────────────────────────
    // Dust hole geometry measurements
    const { disOfHeight: dustHoleOuterHeight, disOfWidth: dustHoleWidth } =
      getDistanceOfFirstAndLastPoint(arc, "path");

    // Indent calculations (bottom-left)
    const bottomLeftIndent = considerDustHole
      ? Math.max(0, indent.bl - dustHoleWidth)
      : indent.bl;

    // Vertical movement calculation
    const verticalMoveToTop = considerDustHole
      ? mappedDustSize - indent.bl
      : mappedDustSize - indent.bl;

    // Base-to-hole vertical compensation
    const baseToHoleEndOffset = this.safeFoldOffset - dustHoleOuterHeight;

    const dustStartPoint = considerDustHole
      ? getLastPointFromPath(arc)
      : [0, -this.safeFoldOffset];

    const dust = new Pacsaz.shapes.LineChain(
      [],
      (pb) =>
        pb
          .draw(
            bottomLeftIndent,
            considerDustHole ? indent.bl - baseToHoleEndOffset : indent.bl,
          )
          .draw(indent.tl, verticalMoveToTop)
          .right(
            this.height -
              indent.br -
              bottomLeftIndent -
              indent.tl -
              indent.tr -
              (considerDustHole ? dustHoleWidth : 0) -
              (considerOuterIndent ? this.thickness : 0),
          )
          .draw(indent.tr, -mappedDustSize + dustHeight.r.inner)
          .draw(indent.br, -(dustHeight.r.inner - dustHeight.r.outer))
          .down(dustHeight.r.outer)
          .right(considerOuterIndent ? this.thickness : 0),
      {
        filletRaduis: 10,
        indices: [3],
        startPoint: dustStartPoint,
      },
    );

    const trim = {
      models: { dust },
      paths: { arc },
    };

    this.$pushModel({ trim });
  }

  // ──────────────────── Utils ────────────────────

  private $mapDustSize(width: number, dustSize: number, height: number) {
    return width <= dustSize * 2 ? height / 2 : dustSize;
  }

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
