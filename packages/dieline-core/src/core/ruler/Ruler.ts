import M, { IModel, IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";
import { getOverallSizes } from "@repo/store/getters";

export class Ruler implements IModel {
  models?: M.IModelMap | undefined;
  protected rulerAngle: number = 0;
  private overallSizes = getOverallSizes();

  ruler(from: IPoint, to: IPoint, value: number, textLayer?: string): IModel {
    const line = this.line(from, to);
    const indicator = this.indicator(from, to);
    const text = this.text(from, to, value, textLayer);
    const pointer = this.pointer(from, to);

    return {
      models: {
        line,
        pointer,
        indicator,
        text,
      },
    };
  }

  private line(from: IPoint, to: IPoint): IModel {
    const temp = new M.paths.Line([from, to]);
    this.rulerAngle = M.angle.ofLineInDegrees(temp);
    const center = M.measure.modelExtents({ paths: { temp } })!.center;
    const padding = this.$textPadding(this.rulerAngle);
    const circle = new M.paths.Circle(padding);
    M.model.move(circle, center);
    const intersections = M.path.intersection(temp, circle);
    const beforEnds = intersections.intersectionPoints[0]!;
    const startBegins = intersections.intersectionPoints[1]!;

    const lineA = new Pacsaz.shapes.Lines([from, beforEnds]);
    const lineB = new Pacsaz.shapes.Lines([startBegins, to]);

    return { models: { lineA, lineB } };
  }

  private text(
    from: IPoint,
    to: IPoint,
    value: number,
    textLayer?: string,
  ): IModel {
    const temp = new M.paths.Line([from, to]);
    const center = M.measure.modelExtents({ paths: { temp } })!.center;

    const text = new Pacsaz.shapes.Text(
      `${value} mm`,
      center,
      textLayer ?? "dielineRulerText",
    );

    return { models: { text } };
  }

  private pointer(from: IPoint, to: IPoint): IModel {
    const pointerRadius = this.pointerRadius;
    console.log("pointerRadius", pointerRadius);
    const pointerA = new Pacsaz.shapes.Polygon(pointerRadius, 3, -90)
      .move([from[0]!, from[1]! + pointerRadius])
      .rotate(-(90 - this.rulerAngle), "bottom");

    const pointerB = new Pacsaz.shapes.Polygon(pointerRadius, 3)
      .move([to[0]!, to[1]! - pointerRadius])
      .rotate(-(90 - this.rulerAngle), "top");

    return { models: { pointerA, pointerB }, layer: "dielinePointer" };
  }

  private indicator(from: IPoint, to: IPoint): IModel {
    const indicatorSize = this.pointerRadius * 2;
    const IdcrA = new Pacsaz.shapes.Line(indicatorSize)
      .center()
      .move(from)
      .rotate(-(90 - this.rulerAngle));

    const IdcrB = new Pacsaz.shapes.Line(indicatorSize)
      .center()
      .move(to)
      .rotate(-(90 - this.rulerAngle));

    return { models: { IdcrA, IdcrB } };
  }

  // -------------- UTILS --------------

  private get pointerRadius() {
    const area = this.overallSizes.trim!.width * this.overallSizes.trim!.height;
    console.log(Math.sqrt(area / 10000));
    return Math.max(1.5, Math.min(3, Math.sqrt(area / 10000)));
  }

  private $textPadding(angle: number) {
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
}
