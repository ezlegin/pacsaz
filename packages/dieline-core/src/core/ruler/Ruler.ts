import M, { IModel, IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";
import { DimensionType } from "@repo/store/data/types";

export abstract class Ruler implements IModel {
  models?: M.IModelMap | undefined;
  private rulerAngle: number = 0;

  ruler(from: IPoint, to: IPoint, value: number, textLayer?: string): IModel {
    // Calcs
    const temp = new M.paths.Line([from, to]);
    this.rulerAngle = M.angle.ofLineInDegrees(temp);
    const center = M.measure.modelExtents({ paths: { temp } })!.center;
    const padding = this.$padding(this.rulerAngle);
    const circle = new M.paths.Circle(padding);
    M.model.move(circle, center);
    const intersections = M.path.intersection(temp, circle);
    const beforEnds = intersections.intersectionPoints[0]!;
    const startBegins = intersections.intersectionPoints[1]!;

    // Line
    const lineA = new Pacsaz.shapes.LineChain([from, beforEnds]);
    const lineB = new Pacsaz.shapes.LineChain([startBegins, to]);

    // Pointer
    const pointerRadius = 1.8;
    const pointerB = new Pacsaz.shapes.Polygon(3, pointerRadius)
      .originate([to[0]!, to[1]! - pointerRadius])
      .rotate(-(90 - this.rulerAngle), to);

    const pointerA = new Pacsaz.shapes.Polygon(3, pointerRadius, -90)
      .originate([from[0]!, from[1]! + pointerRadius])
      .rotate(-(90 - this.rulerAngle), from);

    // Indicator
    const indicator = this.indicator(from, to);

    // Text
    const text = new Pacsaz.shapes.Text(
      `${value} mm`,
      center,
      textLayer ?? "dielineRulerText",
    );

    return { models: { lineA, lineB, pointerA, pointerB, indicator, text } };
  }

  private indicator(start: IPoint, end: IPoint): IModel {
    const startIdcr = new Pacsaz.shapes.Line(4, [0, 0])
      .center()
      .move(start)
      .rotate(-(90 - this.rulerAngle), start);

    const endIdcr = new Pacsaz.shapes.Line(4, [0, 0])
      .center()
      .move(end)
      .rotate(-(90 - this.rulerAngle), end);

    return { models: { startIdcr, endIdcr } };
  }

  private $padding(angle: number) {
    if (angle < 20) {
      return 15;
    }
    if (angle < 30) {
      return 13;
    }
    if (angle < 50) {
      return 9;
    }
    return 7;
  }

  protected get offsetAmount() {
    return 0;
  }

  protected $offset(dimensionType: DimensionType) {
    switch (dimensionType) {
      case "manufacture":
        return 0;
      case "inner":
        return this.offsetAmount;
      case "outer":
        return -this.offsetAmount;
    }
  }
}
