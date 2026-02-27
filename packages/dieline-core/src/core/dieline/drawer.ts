import { getDielineSpec, ISpec } from "@repo/store/dieline/dielineSpec.store";
import { evaluate } from "mathjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  private get shapes() {
    return getDielineSpec().shapes;
  }
  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 0,
  };

  private line(line: NonNullable<ISpec.Shapes["line"]>) {
    this.$drawShapes<"line">(line, ({ angle, length }) => {
      const lineLength = this.$parseMathStr(length);
      return new Pacsaz.shapes.Line(lineLength, +angle);
    });
  }

  private rectangle(rectangle: NonNullable<ISpec.Shapes["rectangle"]>) {
    this.$drawShapes<"rectangle">(rectangle, ({ height, width }) => {
      const rectWidth = this.$parseMathStr(width);
      const rectHeight = this.$parseMathStr(height);
      return new Pacsaz.shapes.Rectangle(rectWidth, rectHeight);
    });
  }

  private circle(circle: NonNullable<ISpec.Shapes["circle"]>) {
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

  private $drawShapes<T extends ISpec.ShapesKey>(
    shapes: NonNullable<ISpec.Shapes[T]>,
    callBack: (val: NonNullable<ISpec.Shapes[T]>[number]) => Shape,
  ) {
    for (const shape of shapes) {
      if (shape.hidden) continue;

      const model = callBack(shape);

      if (shape.origin) {
        model.move([
          this.$parseMathStr(shape.origin[0]),
          this.$parseMathStr(shape.origin[1]),
        ]);
      }

      this.$pushShape(model, shape.key, shape.layer);
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
