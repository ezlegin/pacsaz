import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../data/consts";
import Pacsaz from "../Pacsaz";
import { Model } from "./Model";

export class SnapLock extends Model {
  private arcRadius = this.safeFoldOffset;
  private offsetFromBase = this.arcRadius / 2;
  private lockHeightRaw = this.height * 0.75;
  private toothHeight = this.lockHeightRaw / 3;
  private toothWidthRaw = this.$toothWidth(
    this.lockHeightRaw,
    this.toothHeight,
  );
  private toothWidth = this.toothWidthRaw - this.arcRadius;
  private toungeWidth = this.width - this.toothWidth * 2 - this.arcRadius * 2;
  private cornerRadius = 3; //mm
  private lockHorizon = this.lockHeightRaw - this.toothHeight;

  constructor() {
    super();
    this.$pushModel("snap-lock", this.trim(), this.fold());
  }

  protected override trim() {
    const mounth = this.mouth();
    const dustL = this.dust();
    const dustR = new Pacsaz.shape.ToShape(this.dust(false))
      .mirror(true, false)
      .move([this.width + this.height, 0]);

    const tounge = this.tounge();

    return { mounth, dust: dustL, tounge, dustR };
  }

  protected override fold() {
    const endPoint = [this.width * 2 + this.height * 2, 0];
    const temp = new M.paths.Line([zero, endPoint]);

    const trims: IModel = { models: this.trim() };
    const chain = M.model.findSingleChain(trims);
    const combinedModel = M.chain.toNewModel(chain);

    let intersectionPoints: IPoint[] = [];

    for (const pathId in combinedModel.paths) {
      const path = combinedModel.paths[pathId]!;
      const ints = M.path.intersection(temp, path);
      if (ints) {
        const intPoint = ints.intersectionPoints[0]!;
        const lastPoint = intersectionPoints.at(-1);
        const isEqual =
          lastPoint && M.measure.isPointEqual(intPoint, lastPoint);
        if (!isEqual) intersectionPoints.push(intPoint);
      }
    }

    let folds: IModel = {};
    for (let i = intersectionPoints.length; i > 0; i -= 2) {
      const p1 = intersectionPoints[i - 1]!;
      const p2 = intersectionPoints[i - 2]!;
      const fold = new Pacsaz.shapes.Lines([p1, p2]);
      Pacsaz.shape.push(folds, "fold", fold);
    }

    return { folds };
  }

  private mouth(): IModel {
    const fitInOffset = {
      x: this.thickness < 1.5 ? 0.5 : 1,
      y: this.thickness,
    };
    const lockHeight = this.lockHeightRaw - this.offsetFromBase;

    const arc = new Pacsaz.shapes.Arc(this.arcRadius, 0, 90).move([
      0,
      -this.offsetFromBase,
    ]);

    const pb = new Pacsaz.point.Builder(arc.points.start);

    const line = new Pacsaz.shapes.Lines(
      pb
        .down(lockHeight)
        .right(this.toothWidth - fitInOffset.x)
        .up(this.toothHeight + fitInOffset.y)
        .right(this.toungeWidth + fitInOffset.x * 2)
        .down(this.toothHeight + fitInOffset.y)
        .right(this.toothWidth - fitInOffset.x)
        .up(lockHeight)
        .build(),
      {
        filletRadius: this.cornerRadius,
        indices: [2, 5],
      },
    );

    arc
      .dup()
      .mirror(true, false)
      .move([this.width - this.arcRadius, 0]);

    return {
      models: { line, startArc: arc },
    };
  }

  private dust(considerStarterArc = true): IModel {
    const lockerIndent = 5;

    const startArc = new Pacsaz.shapes.Arc(this.arcRadius, 30, 90).move([
      this.width,
      -this.offsetFromBase,
    ]);

    const pb = new Pacsaz.point.Builder(
      considerStarterArc ? startArc.points.start : [this.width, 0],
    );

    const line = new Pacsaz.shapes.Lines(
      pb
        .draw(
          this.lockHorizon - (considerStarterArc ? startArc.size.width : 0),
          -this.toothWidthRaw,
        )
        .draw(-lockerIndent, -this.toothHeight)
        .right(lockerIndent + this.height - this.lockHorizon - this.arcRadius)
        .up(this.toothWidthRaw + this.toothHeight - this.offsetFromBase)
        .build(),
      { filletRadius: this.cornerRadius, indices: [2] },
    );

    const endArc = new Pacsaz.shapes.Arc(this.arcRadius, 90, 180).move([
      this.width + this.height,
      -this.offsetFromBase,
    ]);

    return {
      models: { startArc: considerStarterArc ? startArc : {}, line, endArc },
    };
  }

  private tounge() {
    const arc = new Pacsaz.shapes.Arc(this.arcRadius, 30, 90).move([
      this.width + this.height,
      -this.offsetFromBase,
    ]);

    const difOfArcs = this.arcRadius - arc.size.width;

    const pb = new Pacsaz.point.Builder(arc.points.start);

    const line = new Pacsaz.shapes.Lines(
      pb
        .draw(this.toothWidth + difOfArcs, -this.lockHorizon)
        .down(this.toothHeight)
        .right(this.toungeWidth)
        .up(this.toothHeight)
        .draw(this.toothWidth + difOfArcs, this.lockHorizon)
        .build(),
      { filletRadius: this.cornerRadius, indices: [2, 3] },
    );

    arc
      .dup()
      .mirror(true, false)
      .move([this.width - arc.size.width, 0]);

    return {
      models: { line, arc },
    };
  }

  // ----------------- UTILS -----------------

  $toothWidth(lockHeightRaw: number, tabHeight: number) {
    let tabWidth: number = this.width / 3;

    if (this.width >= 70) tabWidth = this.width / 4;
    if (this.width >= 140) tabWidth = this.width / 5;
    if (this.width >= 230) tabWidth = this.width / 6;

    const maxTabWidth = lockHeightRaw - tabHeight;

    return Math.min(maxTabWidth, tabWidth);
  }
}
