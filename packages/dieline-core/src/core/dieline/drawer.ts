import { getDielineSpec, ISpec } from "@repo/store/editor/dielineSpec.store";
import { getVariables } from "@repo/store/editor/variables.store";
import { evaluate } from "mathjs";
import { toMm } from "../../utils/sizeConvertor";
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
    this.$drawShapes(line, ({ angle, length }, scope) => {
      const lineLength = this.$parseMathStr(length, scope);
      return new Pacsaz.shapes.Line(lineLength, +angle);
    });
  }

  private lines(lines: NonNullable<ISpec.Shapes["lines"]>) {
    this.$drawShapes(
      lines,
      (
        {
          absolutePts,
          relativePts,
          isRelative,
          filletRadius,
          indices,
          isClosed,
        },
        scope,
      ) => {
        const options = {
          closed: isClosed,
          filletRadius: filletRadius ? toMm(+filletRadius) : undefined,
          indices: indices ? indices.split(",").map((i) => +i) : undefined,
        };

        if (isRelative) {
          if (!relativePts) throw new Error("Points Not Avaiable.");

          const pb = new Pacsaz.point.Builder([
            this.$parseMathStr(relativePts.startPt[0], scope),
            this.$parseMathStr(relativePts.startPt[1], scope),
          ]);

          for (const pt of relativePts.pts) {
            const direction = pt[2];
            switch (direction) {
              case "up":
                pb.up(this.$parseMathStr(pt[0], scope));
                break;
              case "down":
                pb.down(this.$parseMathStr(pt[0], scope));
                break;
              case "right":
                pb.right(this.$parseMathStr(pt[0], scope));
                break;
              case "left":
                pb.left(this.$parseMathStr(pt[0], scope));
                break;
              case "draw":
                pb.draw(
                  this.$parseMathStr(pt[0], scope),
                  this.$parseMathStr(pt[1]!, scope),
                );
                break;
            }
          }

          return new Pacsaz.shapes.Lines(pb.build(), options);
        } else {
          if (!absolutePts) throw new Error("Points Not Avaiable.");
          const parsedPts = absolutePts.map((pt) => [
            this.$parseMathStr(pt[0], scope),
            this.$parseMathStr(pt[1], scope),
          ]);
          return new Pacsaz.shapes.Lines(parsedPts, options);
        }
      },
    );
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

  private polygon(polygon: NonNullable<ISpec.Shapes["polygon"]>) {
    this.$drawShapes(polygon, ({ radius, sides }, scope) => {
      const polygonRadius = this.$parseMathStr(radius, scope);
      return new Pacsaz.shapes.Polygon(polygonRadius, +sides);
    });
  }

  protected override draw() {
    if (this.shapes.line) this.line(this.shapes.line);
    if (this.shapes.lines) this.lines(this.shapes.lines);
    if (this.shapes.rectangle) this.rectangle(this.shapes.rectangle);
    if (this.shapes.circle) this.circle(this.shapes.circle);
    if (this.shapes.polygon) this.polygon(this.shapes.polygon);
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
