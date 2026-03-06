import { getDielineSpec, ISpec } from "@repo/store/editor/dielineSpec.store";
import { getVariables } from "@repo/store/editor/variables.store";
import { IModel } from "makerjs";
import { evaluate } from "mathjs";
import { toMm } from "../../utils/sizeConvertor";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  private get shapes() {
    return getDielineSpec().shapes;
  }
  private get rulers() {
    return getDielineSpec().rulers;
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
    this.$drawShapes(
      rectangle,
      ({ height, width, radius, deleteSide }, scope) => {
        const rectWidth = this.$parseMathStr(width, scope);
        const rectHeight = this.$parseMathStr(height, scope);
        return new Pacsaz.shapes.Rectangle(rectWidth, rectHeight, {
          radius: +radius,
          deleteSide,
        });
      },
    );
  }

  private circle(circle: NonNullable<ISpec.Shapes["circle"]>) {
    this.$drawShapes(circle, ({ radius, semiCircleDirection }, scope) => {
      const circleRadius = this.$parseMathStr(radius, scope);
      if (semiCircleDirection) {
        return new Pacsaz.shapes.SemiCircle(circleRadius, semiCircleDirection);
      } else {
        return new Pacsaz.shapes.Circle(circleRadius);
      }
    });
  }

  private polygon(polygon: NonNullable<ISpec.Shapes["polygon"]>) {
    this.$drawShapes(polygon, ({ radius, sides }, scope) => {
      const polygonRadius = this.$parseMathStr(radius, scope);
      return new Pacsaz.shapes.Polygon(polygonRadius, +sides);
    });
  }

  private arc(arc: NonNullable<ISpec.Shapes["arc"]>) {
    this.$drawShapes(arc, ({ radius, startAngle, endAngle }, scope) => {
      const polygonRadius = this.$parseMathStr(radius, scope);
      const start = this.$parseMathStr(startAngle, scope);
      const end = this.$parseMathStr(endAngle, scope);
      return new Pacsaz.shapes.Arc(polygonRadius, start, end);
    });
  }

  protected override drawer() {
    const line = this.$checkExistance(this.shapes.line);
    const lines = this.$checkExistance(this.shapes.lines);
    const rectangle = this.$checkExistance(this.shapes.rectangle);
    const circle = this.$checkExistance(this.shapes.circle);
    const polygon = this.$checkExistance(this.shapes.polygon);
    const arc = this.$checkExistance(this.shapes.arc);

    if (line) this.line(line);
    if (lines) this.lines(lines);
    if (rectangle) this.rectangle(rectangle);
    if (circle) this.circle(circle);
    if (polygon) this.polygon(polygon);
    if (arc) this.arc(arc);

    const rulers = this.$checkExistance(this.rulers);
    if (rulers) {
      let models: Record<string, IModel> = {
        overall: new Pacsaz.ruler.OverallRuler(this.trimModel),
      };
      for (const r of rulers) {
        if (r.hidden) break;

        const from = [
          this.$parseMathStr(r.from[0], this.scope),
          this.$parseMathStr(r.from[1], this.scope),
        ];
        const to = [
          this.$parseMathStr(r.to[0], this.scope),
          this.$parseMathStr(r.to[1], this.scope),
        ];
        const value = this.$parseMathStr(r.value, this.scope);
        const offset = this.$parseMathStr(r.offset, this.scope);

        const model = new Pacsaz.ruler.DielineRuler(from, to, value, offset);
        models[r.key] = model;
      }

      this.$pushRuler(models);
    }
  }

  // -------------------- UTILS --------------------

  private $checkExistance<T extends ISpec.ShapesMap | ISpec.Rulers>(
    shapes: T | undefined,
  ) {
    if (shapes && shapes.length > 0) return shapes;
  }

  private $drawShapes<T extends ISpec.ShapesMap>(
    shapes: T,
    callBack: (val: T[number], scope: Record<string, number>) => Shape,
  ) {
    const scope = this.scope;
    for (const shape of shapes) {
      if (shape.hidden) continue;

      const model = callBack(shape, scope);

      if (shape.origin) {
        model.moveTo([
          this.$parseMathStr(shape.origin[0], scope),
          this.$parseMathStr(shape.origin[1], scope),
        ]);
      }

      const dup = shape.dup;
      if (dup && dup.length > 0) {
        for (const d of dup) {
          model.dup();
          console.log(dup);

          for (const op of d.operations) {
            switch (op.type) {
              case "zero":
                model.zero();
                break;

              case "center":
                model.center();
                break;

              case "mirror":
                if (op.x || op.y) model.mirror(op.x, op.y);
                break;

              case "move":
                const move = {
                  x: this.$parseMathStr(op.value[0], scope),
                  y: this.$parseMathStr(op.value[1], scope),
                };
                if (move.x > 0 || move.y > 0) model.move([move.x, move.y]);
                break;

              case "moveTo":
                const moveTo = {
                  x: this.$parseMathStr(op.value[0], scope),
                  y: this.$parseMathStr(op.value[1], scope),
                };
                if (moveTo.x > 0 || moveTo.y > 0)
                  model.moveTo([moveTo.x, moveTo.y]);
                break;

              case "rotate":
                model.rotate(+op.value);
                break;

              case "scale":
                model.scale(+op.value);
                break;
            }
          }
        }
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
      twoWidth: this.width * 2,
      length: this.length,
      twoLength: this.length * 2,
      height: this.height,
      twoHeight: this.height * 2,
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
