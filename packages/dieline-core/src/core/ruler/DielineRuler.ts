import M, { IModel, IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { DimensionType } from "@repo/store/data/types";

export class DielineRuler extends Ruler implements IModel {
  models?: M.IModelMap | undefined;

  constructor(
    private width: number,
    private length: number,
  ) {
    super();
    const { dimensionType } = getDielineSettings();
    const offset = this.offset(dimensionType);

    const points = {
      length: {
        from: [this.width / 4, offset],
        to: [this.width / 4, this.length - offset],
      },
      width: {
        from: [offset, this.length / 4],
        to: [this.width - offset, this.length / 4],
      },
      //todo: add height
    };

    const lengthRuler = this.ruler(
      points.length.from,
      points.length.to,
      this.length,
    );
    const lengthIdcr = this.indicator(points.length.from, points.length.to);

    const widthRuler = this.ruler(
      points.width.from,
      points.width.to,
      this.width,
    );
    const widthIdcr = this.indicator(points.width.from, points.width.to);

    Pacsaz.shape.push(this, "dielineRuler", {
      models: { lengthRuler, widthRuler, widthIdcr, lengthIdcr },
    });
  }

  private offset(dimensionType: DimensionType) {
    const o = this.width * 0.02;
    switch (dimensionType) {
      case "manufacture":
        return 0;
      case "inner":
        return o;
      case "outer":
        return -o;
    }
  }

  private indicator(start: IPoint, end: IPoint): IModel {
    const startIdcr = new Pacsaz.shapes.Line(4, [0, 0])
      .center()
      .move(start)
      .rotate(90 - this.rulerAngle, start);

    const endIdcr = new Pacsaz.shapes.Line(4, [0, 0])
      .center()
      .move(end)
      .rotate(90 - this.rulerAngle, end);

    return { models: { startIdcr, endIdcr } };
  }
}
