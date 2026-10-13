import { ISpec, IVar } from "@repo/store/types";
import { evaluate } from "mathjs";
import M from "makerjs";
import Pacsaz from "../Pacsaz";
import { Shape } from "../shapes/Shape";
import { Dieline } from "./Dieline";
import { applyBoolean } from "../helpers/boolean";
import { applyJoin } from "../helpers/join";
import { addFillet, addFilletAt } from "../helpers/addFillet";
import { applyArray } from "../helpers/applyArray";

type ShapeNode = Exclude<ISpec.Node, ISpec.Group>;

export class Drawer extends Dieline {
  constructor(
    private nodes: ISpec.Nodes,
    private variables: IVar.VariableMap,
  ) {
    super();
  }

  private line(line: ISpec.LineSpec): Shape {
    return this.$build(line, ({ angle, length }, scope) => {
      return new Pacsaz.shapes.Line(this.$parseMathStr(length, scope), +angle);
    });
  }

  private lines(lines: ISpec.LinesSpec): Shape {
    return this.$build(
      lines,
      ({ absolutePts, relativePts, isRelative, isClosed, effects }, scope) => {
        const resolved = this.$resolveEffects(effects, scope);

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

          return new Pacsaz.shapes.Lines(pb.build(), {
            closed: isClosed,
            effects: resolved,
          });
        }

        if (!absolutePts) throw new Error("Points Not Avaiable.");
        const parsedPts = absolutePts.map((pt) => [
          this.$parseMathStr(pt[0], scope),
          this.$parseMathStr(pt[1], scope),
        ]);
        return new Pacsaz.shapes.Lines(parsedPts, {
          closed: isClosed,
          effects: resolved,
        });
      },
    );
  }

  private rectangle(rect: ISpec.RectangleSpec): Shape {
    return this.$build(
      rect,
      ({ width, height, deleteSide, effects }, scope) => {
        const resolved = this.$resolveEffects(effects, scope);
        return new Pacsaz.shapes.Rectangle(
          this.$parseMathStr(width, scope),
          this.$parseMathStr(height, scope),
          { deleteSide, effects: resolved },
        );
      },
    );
  }

  private circle(circle: ISpec.CircleSpec): Shape {
    return this.$build(
      circle,
      ({ id, radiusX, radiusY, radius, semiCircleDirection }, scope) => {
        const circleRadius = this.$parseMathStr(radius, scope);
        if (semiCircleDirection) {
          return new Pacsaz.shapes.SemiCircle(
            id,
            circleRadius,
            semiCircleDirection,
          );
        }
        const circleRadiusX = this.$parseMathStr(radiusX, scope);
        const circleRadiusY = this.$parseMathStr(radiusY, scope);
        return new Pacsaz.shapes.Ellipse(id, circleRadiusX, circleRadiusY);
      },
    );
  }

  private polygon(polygon: ISpec.PolygonSpec): Shape {
    return this.$build(polygon, ({ radius, sides, effects }, scope) => {
      const resolved = this.$resolveEffects(effects, scope);
      return new Pacsaz.shapes.Polygon(
        this.$parseMathStr(radius, scope),
        +sides,
        undefined,
        { effects: resolved },
      );
    });
  }

  private arc(arc: ISpec.ArcSpec): Shape {
    return this.$build(arc, ({ radius, startAngle, endAngle }, scope) => {
      const start = this.$parseMathStr(startAngle, scope);
      const end = this.$parseMathStr(endAngle, scope);
      return new Pacsaz.shapes.Arc(
        this.$parseMathStr(radius, scope),
        start,
        end,
      );
    });
  }

  //! ------------------------ Traversal ------------------------

  override drawShapes() {
    for (const node of this.nodes) {
      this.renderNode(node);
    }
  }

  private renderNode(node: ISpec.Node) {
    if (node.hidden) return;

    if (node.type === "group") {
      const model = this.$buildGroup(node);
      Pacsaz.shape.push(this.trimModel, node.id, model); //todo: push to right model based on layer.
      return;
    }

    const shape = this.$buildShape(node);
    Pacsaz.shape.push(this[`${node.layer}Model`], node.id, shape);
  }

  private $buildShape(node: ShapeNode): Shape {
    switch (node.type) {
      case "line":
        return this.line(node);
      case "circle":
        return this.circle(node);
      case "arc":
        return this.arc(node);
      case "lines":
        return this.lines(node);
      case "polygon":
        return this.polygon(node);
      case "rectangle":
        return this.rectangle(node);
    }
  }

  private $buildGroup(group: ISpec.Group): M.IModel {
    const scope = this.scope;

    const children: M.IModel[] = [];
    for (const child of group.nodes) {
      if (child.hidden) continue;
      children.push(
        child.type === "group"
          ? this.$buildGroup(child)
          : this.$buildShape(child),
      );
    }

    const resolved = this.$resolveEffects(group.effects, scope) ?? [];

    const combiners = resolved.filter(
      (e) => e.type === "join" || e.type === "boolean",
    );
    const modifiers = resolved.filter(
      (e) => e.type === "radius" || e.type === "radiusAt" || e.type === "array",
    );

    let combined: M.IModel = {
      models: Object.fromEntries(children.map((c, i) => [`child-${i}`, c])),
    };

    for (const efx of combiners) {
      switch (efx.type) {
        case "join":
          combined = applyJoin(children, efx.mode);
          break;
        case "boolean":
          combined = applyBoolean(children, efx.mode);
          break;
      }
    }

    for (const efx of modifiers) {
      switch (efx.type) {
        case "radius":
          combined = addFillet(combined, +efx.value);
          break;

        case "radiusAt":
          combined = addFilletAt(
            combined,
            efx.targets.map((t) => Number(t)),
            +efx.value,
          );
          break;

        case "array":
          combined = applyArray(combined, efx);
          break;
      }
    }

    // Groups support the same dup operations as shapes.
    this.$applyDup(combined, group.dup, scope);

    return combined;
  }
  //! ------------------------ Utils ------------------------

  private $build<T extends ShapeNode>(
    item: T,
    callBack: (val: T, scope: Record<string, number>) => Shape,
  ): Shape {
    const scope = this.scope;
    const model = callBack(item, scope);

    model.moveTo([
      this.$parseMathStr(item.origin[0], scope),
      this.$parseMathStr(item.origin[1], scope),
    ]);

    this.$applyDup(model, item.dup, scope);

    return model;
  }

  /**
   * Applies `dup` operations onto an already-built model.
   *
   * Shapes already expose the whole operation chain through the `Shape` class, so
   * they keep using it (unchanged behaviour). Group models are plain makerjs
   * models, so they are driven through the `M.model.*` primitives instead.
   */
  private $applyDup(
    model: M.IModel,
    dup: ISpec.Dup | undefined,
    scope: Record<string, number>,
  ): void {
    if (!dup || dup.length === 0) return;

    // `modelExtents` returns null for models with no geometry (e.g. a group whose
    // children are all hidden), so guard before reading width / height.
    const size = M.measure.modelExtents(model);

    const dupScope: Record<string, number> = {
      ...scope,
      ...(size ? { selfWidth: size.width, selfHeight: size.height } : {}),
    };

    if (model instanceof Shape) {
      this.$applyDupOnShape(model, dup, dupScope);
      return;
    }

    this.$applyDupOnModel(model, dup, dupScope);
  }

  /** Dup for shapes — the `Shape` class owns clone/zero/mirror/... state. */
  private $applyDupOnShape(
    model: Shape,
    dup: ISpec.Dup,
    dupScope: Record<string, number>,
  ): void {
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
            model.move([
              this.$parseMathStr(op.value[0], dupScope),
              this.$parseMathStr(op.value[1], dupScope),
            ]);
            break;

          case "moveTo":
            model.moveTo([
              this.$parseMathStr(op.value[0], dupScope),
              this.$parseMathStr(op.value[1], dupScope),
            ]);
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

  /**
   * Dup for groups. Each entry clones the group model into a fresh child, then
   * mutates that child with the plain makerjs primitives.
   */
  private $applyDupOnModel(
    model: M.IModel,
    dup: ISpec.Dup,
    dupScope: Record<string, number>,
  ): void {
    for (const d of dup) {
      // `addModel` dedupes colliding ids itself (dup-0, dup-0_1, ...), so a fixed
      // prefix is enough and every clone stays reachable as a child of the group.
      const clone = M.model.clone(model);

      M.model.addModel(model, clone, "dup");

      for (const op of d.operations) {
        switch (op.type) {
          case "zero":
            M.model.zero(clone);
            break;

          case "center":
            M.model.center(clone);
            break;

          case "mirror":
            if (op.x || op.y) M.model.mirror(clone, op.x, op.y);
            break;

          case "move":
            M.model.moveRelative(clone, [
              this.$parseMathStr(op.value[0], dupScope),
              this.$parseMathStr(op.value[1], dupScope),
            ]);
            break;

          case "moveTo":
            M.model.move(clone, [
              this.$parseMathStr(op.value[0], dupScope),
              this.$parseMathStr(op.value[1], dupScope),
            ]);
            break;

          case "rotate":
            M.model.rotate(clone, +op.value);
            break;

          case "scale":
            M.model.scale(clone, +op.value);
            break;
        }
      }
    }
  }

  private $resolveEffects(
    effects: ISpec.ShapeEffect[] | undefined,
    scope: Record<string, number>,
  ): ISpec.ShapeEffect[] | undefined {
    if (!effects) return undefined;

    return effects.map((fx) => {
      switch (fx.type) {
        case "radius":
        case "radiusAt":
          return {
            ...fx,
            value: this.$parseMathStr(fx.value, scope).toString(),
          };

        case "array":
          return {
            ...fx,
            moveX: this.$parseMathStr(fx.moveX, scope).toString(),
            moveY: this.$parseMathStr(fx.moveY, scope).toString(),
            repeat: this.$parseMathStr(fx.repeat, scope).toString(),
          };

        default:
          return fx;
      }
    });
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
