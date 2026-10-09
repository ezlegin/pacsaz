import { ISpec, IVar } from "@repo/store/types";
import { evaluate } from "mathjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  constructor(
    private nodes: ISpec.Nodes,
    private variables: IVar.VariableMap,
  ) {
    super();
  }

  //! ------------------------ Shapes ------------------------
  private line(line: ISpec.LineSpec) {
    this.$pusher(line, ({ angle, length }, scope) => {
      return new Pacsaz.shapes.Line(this.$parseMathStr(length, scope), +angle);
    });
  }

  private lines(lines: ISpec.LinesSpec) {
    this.$pusher(
      lines,
      ({ absolutePts, relativePts, isRelative, isClosed, effects }, scope) => {
        const resolved = effects?.map((fx) => {
          if (fx.type === "radius") {
            return {
              ...fx,
              value: this.$parseMathStr(fx.value, scope).toString(),
            };
          }
          return fx;
        });

        if (isRelative) {
          if (!relativePts) throw new Error("Points Not Avaiable.");

          const pb = new Pacsaz.point.Builder([
            this.$parseMathStr(relativePts.startPt[0], scope),
            this.$parseMathStr(relativePts.startPt[1], scope),
          ]); //todo: this doesn't work.

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

          return new Pacsaz.shapes.Lines(pb.build(), {
            closed: isClosed,
            effects: resolved,
          });
        } else {
          if (!absolutePts) throw new Error("Points Not Avaiable.");
          const parsedPts = absolutePts.map((pt) => [
            this.$parseMathStr(pt[0], scope),
            this.$parseMathStr(pt[1], scope),
          ]);
          return new Pacsaz.shapes.Lines(parsedPts, { closed: isClosed });
        }
      },
    );
  }

  private rectangle(rect: ISpec.RectangleSpec) {
    this.$pusher(rect, ({ width, height, deleteSide, effects }, scope) => {
      const resolved = effects?.map((fx) => {
        if (fx.type === "radius") {
          return {
            ...fx,
            value: this.$parseMathStr(fx.value, scope).toString(),
          };
        }
        return fx;
      });

      return new Pacsaz.shapes.Rectangle(
        this.$parseMathStr(width, scope),
        this.$parseMathStr(height, scope),
        { deleteSide, effects: resolved },
      );
    });
  }

  private circle(circle: ISpec.CircleSpec) {
    this.$pusher(
      circle,
      ({ id, radiusX, radiusY, radius, semiCircleDirection }, scope) => {
        const circleRadius = this.$parseMathStr(radius, scope);
        if (semiCircleDirection) {
          return new Pacsaz.shapes.SemiCircle(
            id,
            circleRadius,
            semiCircleDirection,
          );
        } else {
          const circleRadiusX = this.$parseMathStr(radiusX, scope);
          const circleRadiusY = this.$parseMathStr(radiusY, scope);
          return new Pacsaz.shapes.Ellipse(id, circleRadiusX, circleRadiusY);
        }
      },
    );
  }

  private polygon(polygon: ISpec.PolygonSpec) {
    this.$pusher(polygon, ({ radius, sides, effects }, scope) => {
      const resolved = effects?.map((fx) => {
        if (fx.type === "radius") {
          return {
            ...fx,
            value: this.$parseMathStr(fx.value, scope).toString(),
          };
        }
        return fx;
      });

      return new Pacsaz.shapes.Polygon(
        this.$parseMathStr(radius, scope),
        +sides,
        undefined,
        { effects: resolved },
      );
    });
  }

  private arc(arc: ISpec.ArcSpec) {
    this.$pusher(arc, ({ radius, startAngle, endAngle }, scope) => {
      const start = this.$parseMathStr(startAngle, scope);
      const end = this.$parseMathStr(endAngle, scope);
      return new Pacsaz.shapes.Arc(
        this.$parseMathStr(radius, scope),
        start,
        end,
      );
    });
  }

  override drawShapes() {
    for (const node of this.nodes) {
      this.renderNode(node);
    }
  }

  private renderNode(node: ISpec.Node) {
    if (node.hidden) return;

    if (node.type === "group") {
      for (const child of node.nodes) {
        this.renderNode(child);
      }

      return;
    }

    switch (node.type) {
      case "line":
        this.line(node);
        break;

      case "circle":
        this.circle(node);
        break;

      case "arc":
        this.arc(node);
        break;

      case "lines":
        this.lines(node);
        break;

      case "polygon":
        this.polygon(node);
        break;

      case "rectangle":
        this.rectangle(node);
        break;
    }
  }

  // -------------------- UTILS --------------------

  private $pusher<T extends ISpec.Node>(
    item: T,
    callBack: (val: T, scope: Record<string, number>) => Shape,
  ) {
    const scope = this.scope;
    if (item.hidden) return;

    const model = callBack(item, scope);

    model.moveTo([
      this.$parseMathStr(item.origin[0], scope),
      this.$parseMathStr(item.origin[1], scope),
    ]);

    if (item.dup && item.dup.length > 0) {
      const dupScope = {
        ...scope,
        selfWidth: model.size.width,
        selfHeight: model.size.height,
      };

      for (const d of item.dup) {
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

            case "move": {
              const move = {
                x: this.$parseMathStr(op.value[0], dupScope),
                y: this.$parseMathStr(op.value[1], dupScope),
              };
              model.move([move.x, move.y]);
              break;
            }

            case "moveTo": {
              const moveTo = {
                x: this.$parseMathStr(op.value[0], dupScope),
                y: this.$parseMathStr(op.value[1], dupScope),
              };
              model.moveTo([moveTo.x, moveTo.y]);
              break;
            }

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

    Pacsaz.shape.push(this.trimModel, item.id, model); //todo: push to fold/perf/trim based on layer.
  }

  private get scope() {
    let vars: Record<string, string> = {};

    let scope: Record<string, number> = {
      width: this.width,
      length: this.length,
      height: this.height,
      safeOffset: this.thickness,
    };

    for (const v of this.variables) {
      let matched = false;

      if (v.conditions && v.conditions.length > 0) {
        for (const c of v.conditions) {
          if (evaluate(c.if, scope)) {
            vars[v.name] = c.then;
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        vars[v.name] = v.value;
      }
    }

    for (const [name, expression] of Object.entries(vars)) {
      scope[name] = evaluate(expression, scope);
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

export default Drawer;
