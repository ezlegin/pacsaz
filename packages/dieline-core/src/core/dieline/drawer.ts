import {
  getDielineSpec,
  Shapes,
  ShapesKey,
} from "@repo/store/dieline/dielineSpec.store";
import { evaluate } from "mathjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  private get shapes() {
    return getDielineSpec().dielineSpec.shapes;
  }
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 0,
  };

  private line(line: NonNullable<Shapes["line"]>) {
    this.$drawShapes<"line">(line, ({ angle, length }) => {
      const lineLength = this.$parseMathStr(length);
      return new Pacsaz.shapes.Line(lineLength, +angle);
    });
  }

  private rectangle(rectangle: NonNullable<Shapes["rectangle"]>) {
    this.$drawShapes<"rectangle">(rectangle, ({ height, width }) => {
      const rectWidth = this.$parseMathStr(width);
      const rectHeight = this.$parseMathStr(height);
      return new Pacsaz.shapes.Rectangle(rectWidth, rectHeight);
    });
  }

  private circle(circle: NonNullable<Shapes["circle"]>) {
    this.$drawShapes<"circle">(circle, ({ radius }) => {
      const circleRadius = this.$parseMathStr(radius);
      return new Pacsaz.shapes.Circle(circleRadius);
    });
  }

  protected override draw() {
    if (this.shapes.line) this.line(this.shapes.line);
    if (this.shapes.rectangle) this.rectangle(this.shapes.rectangle);
    if (this.shapes.circle) this.circle(this.shapes.circle);
  }

  // -------------------- UTILS --------------------

  private $drawShapes<T extends ShapesKey>(
    obj: NonNullable<Shapes[T]>,
    callBack: (val: NonNullable<Shapes[T]>[string]) => Shape,
  ) {
    const arr = Object.entries(obj) as [
      string,
      NonNullable<Shapes[T]>[string],
    ][];
    for (const [key, val] of arr) {
      if (val.hidden) continue;

      const model = callBack(val);

      if (val.origin) {
        const originX = this.$parseMathStr(val.origin.x);
        const originY = this.$parseMathStr(val.origin.y);
        model.move([originX, originY]);
      }

      this.$pushShape(model, key, val.layer);
    }
  }

  private $parseMathStr(expr: string): number {
    const scope = {
      width: this.width,
      height: this.height,
      length: this.length,
    };

    return evaluate(expr, scope);
  }
}

export default new Drawer();
