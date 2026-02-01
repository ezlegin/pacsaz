import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { IModel, IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";

type Axis = "width" | "length";

export class Ruler {
  model: IModel = {};

  private readonly pointerRadius = 1.8;
  private readonly indicatorSize = 4;
  private readonly dimensionType = getDielineSettings().dimensionType;

  private readonly widthBase: number;
  private readonly lengthBase: number;

  constructor(
    private readonly width: number,
    private readonly length: number,
  ) {
    this.widthBase = length / 4;
    this.lengthBase = width / 4;

    this.buildRuler("length");
    this.buildRuler("width");
  }

  /* ───────────────────────── rulers ───────────────────────── */

  private buildRuler(axis: Axis) {
    const base = this.base(axis);
    const center = this.size(axis) / 2;

    const pointer =
      axis === "length"
        ? this.verticalPointer(base, this.offset)
        : this.horizontalPointer(base, this.offset);

    Pacsaz.shape.push(this.model, `ruler-${axis}`, [
      this.line(axis),
      pointer,
      this.text(axis, center),
      this.indicator(axis),
    ]);
  }

  /* ───────────────────────── parts ───────────────────────── */

  private indicator(axis: Axis): IModel {
    const base = this.base(axis);
    const o = this.offset;
    const angle = axis === "width" ? 90 : 0;

    const points: [IPoint, IPoint] =
      axis === "length"
        ? [
            [base, this.length - o],
            [base, o],
          ]
        : [
            [this.width - o, base],
            [o, base],
          ];

    return new Pacsaz.shapes.Line(this.indicatorSize, [0, 0], angle)
      .center()
      .move(points[0])
      .duplicate()
      .center()
      .move(points[1]);
  }

  private line(axis: Axis): IModel {
    const base = this.base(axis);
    const center = this.size(axis) / 2;
    const offset = this.offset;

    const isLength = axis === "length";
    const boxSize = isLength ? 5 : 14;
    const angle = isLength ? 90 : 0;

    const length = center - boxSize - offset;

    const origins: [IPoint, IPoint] = isLength
      ? [
          [base, offset],
          [base, center + boxSize],
        ]
      : [
          [offset, base],
          [center + boxSize, base],
        ];

    return {
      models: {
        beforeLine: new Pacsaz.shapes.Line(length, origins[0], angle),
        afterLine: new Pacsaz.shapes.Line(length, origins[1], angle),
      },
    };
  }

  private verticalPointer(base: number, offset: number) {
    const p = new Pacsaz.shapes.Polygon(3, this.pointerRadius)
      .originate([base, this.length - this.pointerRadius - offset])
      .duplicate()
      .rotate(180)
      .zero()
      .originate([base, offset]);

    p.move([-p.size.width / 2, 0]);
    return p;
  }

  private horizontalPointer(base: number, offset: number) {
    const p = new Pacsaz.shapes.Polygon(3, this.pointerRadius, 0)
      .originate([this.width - this.pointerRadius - offset, base])
      .duplicate()
      .rotate(180)
      .zero()
      .originate([offset, base]);

    p.move([0, -p.size.height / 2]);
    return p;
  }

  private text(axis: Axis, center: number) {
    const width = getDielineSettings().dimension.raw.width;
    const length = getDielineSettings().dimension.raw.length;

    return axis === "length"
      ? new Pacsaz.shapes.Text(
          `${width} mm`,
          [this.lengthBase, center],
          "rulerText",
        )
      : new Pacsaz.shapes.Text(
          `${length} mm`,
          [center, this.widthBase],
          "rulerText",
        );
  }

  /* ───────────────────────── utils ───────────────────────── */

  private base(axis: Axis) {
    return axis === "length" ? this.lengthBase : this.widthBase;
  }

  private size(axis: Axis) {
    return axis === "length" ? this.length : this.width;
  }

  private get offset() {
    const o = Math.min(0.03 * this.width, 3);
    switch (this.dimensionType) {
      case "inner":
        return o;
      case "outer":
        return -o;
      default:
        return 0;
    }
  }
}
