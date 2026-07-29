import { ISpec, IVar, IEffect } from "@repo/store/types";
import M, { IModel } from "makerjs";
import { evaluate } from "mathjs";
import { toMm } from "../../utils/sizeConvertor";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

export class Drawer extends Dieline {
  constructor(
    private specs: ISpec.Specs,
    private variables: IVar.VariableMap,
    private effects: IEffect.EffectsMap,
  ) {
    super();
  }
  tempModels = new Map<string, Shape & { layer: ISpec.Layer }>();

  //! ------------------------ Shapes ------------------------
  private line(line: ISpec.LineSpec) {
    this.$pusher(line, ({ angle, length }, scope) => {
      return new Pacsaz.shapes.Line(this.$parseMathStr(length, scope), +angle);
    });
  }

  private lines(lines: ISpec.LinesSpec) {
    this.$pusher(
      lines,
      ({ absolutePts, relativePts, isRelative, isClosed }, scope) => {
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

  private rectangle(rectangle: ISpec.RectangleSpec) {
    this.$pusher(rectangle, ({ id, height, width, deleteSide }, scope) => {
      return new Pacsaz.shapes.Rectangle(
        id,
        this.$parseMathStr(width, scope),
        this.$parseMathStr(height, scope),
        {
          deleteSide,
        },
      );
    });
  }

  private circle(circle: ISpec.CircleSpec) {
    this.$pusher(circle, ({ id, radius, semiCircleDirection }, scope) => {
      const circleRadius = this.$parseMathStr(radius, scope);
      if (semiCircleDirection) {
        return new Pacsaz.shapes.SemiCircle(
          id,
          circleRadius,
          semiCircleDirection,
        );
      } else {
        return new Pacsaz.shapes.Circle(id, circleRadius);
      }
    });
  }

  private polygon(polygon: ISpec.PolygonSpec) {
    this.$pusher(polygon, ({ radius, sides }, scope) => {
      return new Pacsaz.shapes.Polygon(
        this.$parseMathStr(radius, scope),
        +sides,
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

  //! ------------------------ Models ------------------------
  private glue(glue: ISpec.GlueSpec) {
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

  private door(door: ISpec.DoorSpec) {
    this.$pusher(door, ({ dustSide, mirror, indentAt }) => {
      const door = new Pacsaz.models.Door(dustSide, indentAt);
      if (mirror.x || mirror.y) {
        door.mirror(mirror.x, mirror.y);
      }
      return door;
    });
  }

  private snapLock(snapLock: ISpec.SnapLockSpec) {
    this.$pusher(snapLock, ({}) => {
      return new Pacsaz.models.SnapLock();
    });
  }

  //! ------------------------ Rulers ------------------------
  private drawRulers() {
    const rulers = this.$checkExistance(this.specs.rulers);
    if (rulers) {
      let models: Record<string, IModel> = {
        overall: new Pacsaz.ruler.OverallRuler(this.trimModel),
      };
      for (const r of rulers) {
        if (r.hidden) continue;

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
    for (const shape of this.specs.shapes) {
      switch (shape.type) {
        case "line":
          this.line(shape);
          break;
        case "circle":
          this.circle(shape);
          break;
        case "arc":
          this.arc(shape);
          break;
        case "lines":
          this.lines(shape);
          break;
        case "polygon":
          this.polygon(shape);
          break;
        case "rectangle":
          this.rectangle(shape);
          break;
      }
    }

    if (this.effects.length > 0) {
      for (const e of this.effects) {
        if (e.hidden) continue;
        switch (e.type) {
          case "boolean": {
            const originModel = M.model.clone(
              this.tempModels.get(e.originModelId)!,
            );
            const targetModel = M.model.clone(
              this.tempModels.get(e.targetModelId)!,
            );

            this.tempModels.delete(e.originModelId)!;
            this.tempModels.delete(e.targetModelId)!;

            let combinedModel: IModel;
            switch (e.booleanType) {
              case "union":
                combinedModel = M.model.combineUnion(
                  originModel!,
                  targetModel!,
                );
                break;
              case "subtract":
                combinedModel = M.model.combineSubtraction(
                  originModel!,
                  targetModel!,
                );
                break;
              case "intersect":
                combinedModel = M.model.combineIntersection(
                  originModel!,
                  targetModel!,
                );
                break;
            }

            this.tempModels.set(
              e.id,
              Object.assign(combinedModel, {
                layer: originModel.layer,
              }) as Shape & { layer: ISpec.Layer },
            );
            break;
          }
          case "radius": {
            const targetModel = M.model.clone(
              this.tempModels.get(e.targetModelId)!,
            );
            this.tempModels.delete(e.targetModelId)!;
            let combined: IModel = {};
            if (e.indices.length > 0) {
              const chain = M.model.findSingleChain(targetModel);
              const links = chain.links;
              const n = links.length;
              const fillets: IModel = { paths: {} };

              for (const { indice, radius } of e.indices) {
                const vertexIndex = Number(indice);
                if (Number.isNaN(vertexIndex)) continue;

                const nextIndex = vertexIndex + 1;
                if (!chain.endless && nextIndex >= n) continue;

                const path1 = links[vertexIndex % n]!.walkedPath.pathContext;
                const path2 = links[nextIndex % n]!.walkedPath.pathContext;

                const filletArc = M.path.fillet(path1, path2, toMm(+radius));
                if (filletArc) {
                  fillets.paths![`fillet_${indice}`] = filletArc;
                }
              }

              combined = {
                models: {
                  targetModel,
                  fillets,
                },
              };
            } else {
              const chain = M.model.findSingleChain(targetModel);
              const fillet = M.chain.fillet(chain, toMm(e.radius));

              combined = {
                models: {
                  targetModel,
                  fillet,
                },
              };
            }

            this.tempModels.set(
              e.id,
              Object.assign(combined, {
                layer: targetModel.layer,
              }) as Shape & { layer: ISpec.Layer },
            );
            break;
          }
        }
      }
    }

    for (const [id, m] of this.tempModels) {
      const model: IModel = { models: m.models }; // simplify model
      this.$pushShape(model, id, m.layer);
    }

    for (const model of this.specs.models) {
      switch (model.type) {
        case "glue":
          this.glue(model);
          break;
        case "door":
          this.door(model);
          break;
        case "snapLock":
          this.snapLock(model);
          break;
      }
    }

    this.drawRulers();
  }

  // -------------------- UTILS --------------------

  private $pusher<T extends ISpec.ShapesSpec | ISpec.ModelsSpec>(
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

            case "move":
              const move = {
                x: this.$parseMathStr(op.value[0], dupScope),
                y: this.$parseMathStr(op.value[1], dupScope),
              };
              model.move([move.x, move.y]);
              break;

            case "moveTo":
              const moveTo = {
                x: this.$parseMathStr(op.value[0], dupScope),
                y: this.$parseMathStr(op.value[1], dupScope),
              };
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
      this.tempModels.set(item.id, Object.assign(model, { layer: item.layer }));
    } else {
      this.$pushModels({ [item.key]: model });
    }
  }

  private $checkExistance<T extends ISpec.Shapes | ISpec.Models | ISpec.Rulers>(
    shapes: T | undefined,
  ) {
    if (shapes && shapes.length > 0) return shapes;
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
