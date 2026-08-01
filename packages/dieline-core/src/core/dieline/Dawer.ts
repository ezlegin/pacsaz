import { IEffect, ISpec, IVar } from "@repo/store/types";
import M, { IModel } from "makerjs";
import { evaluate } from "mathjs";
import { toMm } from "../../utils/sizeConvertor";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";

type TempModel = Shape & { layer: ISpec.Layer };
type Chain = ReturnType<typeof M.model.findSingleChain>;

export class Drawer extends Dieline {
  constructor(
    private specs: ISpec.Specs,
    private variables: IVar.VariableMap,
    private effects: IEffect.EffectsMap,
  ) {
    super();
  }

  tempModels = new Map<string, TempModel>();

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

  override drawShapes() {
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
      this.applyEffects();
    }
    this.flushTempModels();
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
      const doorModel = new Pacsaz.models.Door(dustSide, indentAt);
      if (mirror.x || mirror.y) {
        doorModel.mirror(mirror.x, mirror.y);
      }
      return doorModel;
    });
  }

  private snapLock(snapLock: ISpec.SnapLockSpec) {
    this.$pusher(snapLock, () => {
      return new Pacsaz.models.SnapLock();
    });
  }

  override drawModels() {
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
  }

  //! ------------------------ Effects ------------------------
  private readonly booleanOps: Record<
    IEffect.BooleanEffectSpec["booleanType"],
    (a: IModel, b: IModel) => IModel
  > = {
    union: M.model.combineUnion,
    subtract: M.model.combineSubtraction,
    intersect: M.model.combineIntersection,
  };

  private applyBooleanEffect(effect: IEffect.BooleanEffectSpec) {
    const origin = this.$consumeTempModel(effect.originModelId);
    const target = this.$consumeTempModel(effect.targetModelId);

    const combine = this.booleanOps[effect.booleanType];
    const result = combine(origin, target);

    this.$setTempModel(effect.id, result, origin.layer);
  }

  private applyRadiusEffect(effect: IEffect.RadiusEffectSpec) {
    const target = this.$consumeTempModel(effect.targetModelId);
    const chain = M.model.findSingleChain(target);

    const combined: IModel =
      effect.indices.length > 0
        ? {
            models: {
              targetModel: target,
              fillets: this.$filletAtIndices(chain, effect.indices),
            },
          }
        : {
            models: {
              targetModel: target,
              fillet: M.chain.fillet(chain, toMm(effect.radius)),
            },
          };

    this.$setTempModel(effect.id, combined, target.layer);
  }

  private $filletAtIndices(
    chain: Chain,
    indices: IEffect.RadiusEffectSpec["indices"],
  ): IModel {
    const fillets: IModel = { paths: {} };
    const { links, endless } = chain;
    const n = links.length;

    for (const { indice, radius } of indices) {
      const vertexIndex = Number(indice);
      if (Number.isNaN(vertexIndex)) continue;

      const nextIndex = vertexIndex + 1;
      if (!endless && nextIndex >= n) continue;

      const path1 = links[vertexIndex % n]!.walkedPath.pathContext;
      const path2 = links[nextIndex % n]!.walkedPath.pathContext;

      const filletArc = M.path.fillet(path1, path2, toMm(+radius));
      if (filletArc) {
        fillets.paths![`fillet_${indice}`] = filletArc;
      }
    }

    return fillets;
  }

  private applyEffects() {
    for (const effect of this.effects) {
      if (effect.hidden) continue;
      switch (effect.type) {
        case "boolean":
          this.applyBooleanEffect(effect);
          break;
        case "radius":
          this.applyRadiusEffect(effect);
          break;
      }
    }
  }

  private flushTempModels() {
    for (const [id, m] of this.tempModels) {
      const model: IModel = { models: m.models }; // simplify model
      Pacsaz.shape.push(this[`${m.layer}Model`], id, model);
    }
  }

  //! ------------------------ Rulers ------------------------
  override drawRulers() {
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

    Pacsaz.shape.push(this.main, "ruler", this.rulerModel, "ruler");
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

    if ("layer" in item) {
      this.tempModels.set(item.id, Object.assign(model, { layer: item.layer }));
    } else {
      this.$pushModels({ [item.key]: model });
    }
  }

  /** Retrieves a temp model by id, removes it from the store, and returns a clone. Throws if not found. */
  private $consumeTempModel(id: string): TempModel {
    const model = this.tempModels.get(id);
    if (!model) {
      throw new Error(`Temp model "${id}" was not found.`);
    }
    this.tempModels.delete(id);
    return M.model.clone(model) as TempModel;
  }

  private $setTempModel(id: string, model: IModel, layer: ISpec.Layer) {
    this.tempModels.set(id, Object.assign(model, { layer }) as TempModel);
  }

  private $checkExistance<T extends ISpec.Shapes | ISpec.Models | ISpec.Rulers>(
    item: T | undefined,
  ) {
    if (item && item.length > 0) return item;
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
