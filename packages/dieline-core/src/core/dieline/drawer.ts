import { getDielineSpec, ISpec } from "@repo/store/editor/dielineSpec.store";
import { getVariables } from "@repo/store/editor/variables.store";
import { IModel } from "makerjs";
import { evaluate } from "mathjs";
import { toMm } from "../../utils/sizeConvertor";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  private get specs() {
    const { models, rulers, shapes } = getDielineSpec().specs;
    return { models, rulers, shapes };
  }

  override defaultDimensions = {
    width: 90,
    length: 160,
    height: 50,
  };

  //! ------------------------ Shapes ------------------------

  private line(line: NonNullable<ISpec.Shapes["line"]>) {
    this.$pusher(line, ({ angle, length }, scope) => {
      const lineLength = this.$parseMathStr(length, scope);
      return new Pacsaz.shapes.Line(lineLength, +angle);
    });
  }

  private lines(lines: NonNullable<ISpec.Shapes["lines"]>) {
    this.$pusher(
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
    this.$pusher(rectangle, ({ height, width, radius, deleteSide }, scope) => {
      const rectWidth = this.$parseMathStr(width, scope);
      const rectHeight = this.$parseMathStr(height, scope);
      return new Pacsaz.shapes.Rectangle(rectWidth, rectHeight, {
        radius: +radius,
        deleteSide,
      });
    });
  }

  private circle(circle: NonNullable<ISpec.Shapes["circle"]>) {
    this.$pusher(circle, ({ radius, semiCircleDirection }, scope) => {
      const circleRadius = this.$parseMathStr(radius, scope);
      if (semiCircleDirection) {
        return new Pacsaz.shapes.SemiCircle(circleRadius, semiCircleDirection);
      } else {
        return new Pacsaz.shapes.Circle(circleRadius);
      }
    });
  }

  private polygon(polygon: NonNullable<ISpec.Shapes["polygon"]>) {
    this.$pusher(polygon, ({ radius, sides }, scope) => {
      const polygonRadius = this.$parseMathStr(radius, scope);
      return new Pacsaz.shapes.Polygon(polygonRadius, +sides);
    });
  }

  private arc(arc: NonNullable<ISpec.Shapes["arc"]>) {
    this.$pusher(arc, ({ radius, startAngle, endAngle }, scope) => {
      const polygonRadius = this.$parseMathStr(radius, scope);
      const start = this.$parseMathStr(startAngle, scope);
      const end = this.$parseMathStr(endAngle, scope);
      return new Pacsaz.shapes.Arc(polygonRadius, start, end);
    });
  }

  private drawShapes() {
    const shapes = this.specs.shapes;
    const line = this.$checkExistance(shapes.line);
    const lines = this.$checkExistance(shapes.lines);
    const rectangle = this.$checkExistance(shapes.rectangle);
    const circle = this.$checkExistance(shapes.circle);
    const polygon = this.$checkExistance(shapes.polygon);
    const arc = this.$checkExistance(shapes.arc);

    if (line) this.line(line);
    if (lines) this.lines(lines);
    if (rectangle) this.rectangle(rectangle);
    if (circle) this.circle(circle);
    if (polygon) this.polygon(polygon);
    if (arc) this.arc(arc);
  }

  //! ------------------------ Models ------------------------
  private glue(glue: NonNullable<ISpec.Models["glue"]>) {
    this.$pusher(glue, ({ from, to }, scope) => {
      const glueFrom = [
        this.$parseMathStr(from[0], scope),
        this.$parseMathStr(from[1], scope),
      ];
      const glueTo = [
        this.$parseMathStr(to[0], scope),
        this.$parseMathStr(to[1], scope),
      ];
      return new Pacsaz.models.Glue(glueFrom, glueTo);
    });
  }

  private door(door: NonNullable<ISpec.Models["door"]>) {
    this.$pusher(door, ({ dustSide, mirror, indentAt }) => {
      const door = new Pacsaz.models.Door(dustSide, indentAt);
      if (mirror.x || mirror.y) {
        door.mirror(mirror.x, mirror.y);
      }
      return door;
    });
  }

  private snapLock(snapLock: NonNullable<ISpec.Models["snapLock"]>) {
    this.$pusher(snapLock, ({}) => {
      return new Pacsaz.models.SnapLock();
    });
  }

  private drawModels() {
    const glue = this.$checkExistance(this.specs.models.glue);
    const door = this.$checkExistance(this.specs.models.door);
    const snapLock = this.$checkExistance(this.specs.models.snapLock);
    if (glue) this.glue(glue);
    if (door) this.door(door);
    if (snapLock) this.snapLock(snapLock);
  }

  //! ------------------------ Rulers ------------------------
  private drawRulers() {
    const rulers = this.$checkExistance(this.specs.rulers);
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

  protected override drawer() {
    this.drawShapes();
    this.drawModels();
    this.drawRulers();
  }

  // -------------------- UTILS --------------------

  private $checkExistance<
    T extends ISpec.ShapesMap | ISpec.ModelsMap | ISpec.Rulers,
  >(shapes: T | undefined) {
    if (shapes && shapes.length > 0) return shapes;
  }

  private $pusher<T extends ISpec.ModelsMap | ISpec.ShapesMap>(
    items: T,
    callBack: (val: T[number], scope: Record<string, number>) => Shape,
  ) {
    const scope = this.scope;
    for (const item of items) {
      if (item.hidden) continue;

      const model = callBack(item, scope);

      model.moveTo([
        this.$parseMathStr(item.origin[0], scope),
        this.$parseMathStr(item.origin[1], scope),
      ]);

      const dupScope = {
        ...scope,
        selfWidth: model.size.width,
        selfHeight: model.size.height,
      };

      const dup = item.dup;
      if (dup && dup.length > 0) {
        for (const d of dup) {
          model.dup();

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
                  x: this.$parseMathStr(op.value[0], dupScope),
                  y: this.$parseMathStr(op.value[1], dupScope),
                };
                if (move.x > 0 || move.y > 0) model.move([move.x, move.y]);
                break;

              case "moveTo":
                const moveTo = {
                  x: this.$parseMathStr(op.value[0], dupScope),
                  y: this.$parseMathStr(op.value[1], dupScope),
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

      if ("layer" in item) {
        this.$pushShape(model, item.key, item.layer);
      } else {
        this.$pushModels({ [item.key]: model });
      }
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
      safeOffset: this.thickness,
    };

    for (const v in vars) {
      if (vars[v]) {
        const res = evaluate(vars[v], scope);
        scope[v] = res;
      }
    }

    return scope;
  }

  private $parseMathStr(
    expr: string,
    scope: Record<string, number | Record<string, number>>,
  ): number {
    return evaluate(expr, scope);
  }
}

export default new Drawer();
