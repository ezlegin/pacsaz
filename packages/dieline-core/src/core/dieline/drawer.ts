import { getDielineSpec, ISpec } from "@repo/store/editor/dielineSpec.store";
import { evaluate } from "mathjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";
import { getVariables } from "@repo/store/editor/variables.store";

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
    this.$drawShapes(line, ({ angle, length }, scope) => {
      const lineLength = this.$parseMathStr(length, scope);
      return new Pacsaz.shapes.Line(lineLength, +angle);
    });
  }

  private lines(lines: NonNullable<ISpec.Shapes["lines"]>) {
    this.$drawShapes(lines, ({ pts }, scope) => {
      const parsedPts = pts.map((pt) => [
        this.$parseMathStr(pt[0], scope),
        this.$parseMathStr(pt[1], scope),
      ]);

      return new Pacsaz.shapes.Lines(parsedPts);
    });
  }

  private rectangle(rectangle: NonNullable<ISpec.Shapes["rectangle"]>) {
    this.$drawShapes(rectangle, ({ height, width }, scope) => {
      const rectWidth = this.$parseMathStr(width, scope);
      const rectHeight = this.$parseMathStr(height, scope);
      return new Pacsaz.shapes.Rectangle(rectWidth, rectHeight);
    });
  }

  private circle(circle: NonNullable<ISpec.Shapes["circle"]>) {
    this.$drawShapes(circle, ({ radius }, scope) => {
      const circleRadius = this.$parseMathStr(radius, scope);
      return new Pacsaz.shapes.Circle(circleRadius);
    });
  }

  protected override draw() {
    if (this.shapes.line) this.line(this.shapes.line);
    if (this.shapes.rectangle) this.rectangle(this.shapes.rectangle);
    if (this.shapes.circle) this.circle(this.shapes.circle);
    if (this.shapes.lines) this.lines(this.shapes.lines);
  }

  // -------------------- UTILS --------------------

  private $drawShapes<T extends ISpec.ShapesMap>(
    shapes: T,
    callBack: (val: T[number], scope: Record<string, number>) => Shape,
  ) {
    const scope = this.scope;
    for (const shape of shapes) {
      if (shape.hidden) continue;

      const model = callBack(shape, scope);

      if (shape.origin) {
        model.move([
          this.$parseMathStr(shape.origin[0], scope),
          this.$parseMathStr(shape.origin[1], scope),
        ]);
      }

      this.$pushShape(model, shape.key, shape.layer);
    }
  }

  private get scope() {
    const variables = getVariables();

    let vars: Record<string, string> = {};

    for (const v of variables) {
      vars[v.name] = v.value;
    }

    let scope: Record<string, number> = {
      width: this.width,
      length: this.length,
      height: this.height,
    };

    for (const v in vars) {
      if (vars[v]) {
        const res = evaluate(vars[v], scope);
        scope[v] = res;
      }
    }

    return scope;
  }

  private $parseMathStr(expr: string, scope: Record<string, number>): number {
    return evaluate(expr, scope);
  }
}

export default new Drawer();
