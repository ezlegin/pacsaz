import M, { IModel, IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";

export abstract class Ruler {
  protected ruler(
    from: IPoint,
    to: IPoint,
    value: number,
    textLater?: string,
  ): IModel {
    // Calcs
    const temp = new M.paths.Line([from, to]);
    const angle = M.angle.ofLineInDegrees(temp);
    const center = M.measure.modelExtents({ paths: { temp } })!.center;
    const padding = this.padding(angle);
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
      .rotate(-(90 - angle), to);

    const pointerA = new Pacsaz.shapes.Polygon(3, pointerRadius, -90)
      .originate([from[0]!, from[1]! + pointerRadius])
      .rotate(-(90 - angle), from);

    // Text
    const text = new Pacsaz.shapes.Text(
      `${value} mm`,
      center,
      textLater ?? "dielineRulerText",
    );

    return { models: { lineA, lineB, pointerA, pointerB, text } };
  }

  private padding(angle: number) {
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
