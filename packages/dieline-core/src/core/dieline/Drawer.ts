import { ISpec, IVar } from "@repo/store/types";
import { evaluate } from "mathjs";
import M from "makerjs";
import Pacsaz from "../pacsaz";
import { Shape } from "../shapes/shape";
import { Dieline } from "./Dieline";
import { applyBoolean } from "../helpers/boolean";
import { applyJoin } from "../helpers/join";
import { addFillet, addFilletAt } from "../helpers/addFillet";
import { applyArray } from "../helpers/applyArray";

/** Plain geometry nodes — everything a `Shape` can be built from directly. */
type ShapeNode = Exclude<ISpec.Node, ISpec.Group | ISpec.Model>;

/**
 * A built chunk of geometry together with the layer whose model it belongs in.
 * Groups can mix layers, so their geometry has to stay tagged until it is pushed
 * into `trimModel` / `foldModel` / `perfModel`.
 */
type LayerPart = { layer: ISpec.Layer; model: M.IModel };

const LAYERS: readonly ISpec.Layer[] = ["trim", "fold", "perf"];

function hasGeometry(model: M.IModel | undefined): boolean {
  if (!model) return false;
  if (model.paths && Object.keys(model.paths).length > 0) return true;

  for (const child of Object.values(model.models ?? {})) {
    if (hasGeometry(child)) return true;
  }

  return false;
}

/**
 * `mathjs` spells its logical operators `and` / `or` / `not`, but JavaScript's
 * `&&` / `||` / `!` are what people actually type — and mathjs raises a parse
 * error on them. They are rewritten here so both spellings work.
 *
 * Multi-character operators are replaced first so `&&` never degrades into `and`.
 */
function normalizeCondition(condition: string): string {
  return condition
    .replace(/&&/g, " and ")
    .replace(/\|\|/g, " or ")
    .replace(/!=/g, " != ")
    .replace(/!(?!=)/g, " not ");
}

export class Drawer extends Dieline {
  constructor(
    private nodes: ISpec.Nodes,
    private variables: IVar.VariableMap,
    private rulers: ISpec.Rulers,
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
      ({ absolutePts, relativePts, isRelative, isClosed }, scope) => {
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
          });
        }

        if (!absolutePts) throw new Error("Points Not Avaiable.");
        const parsedPts = absolutePts.map((pt) => [
          this.$parseMathStr(pt[0], scope),
          this.$parseMathStr(pt[1], scope),
        ]);
        return new Pacsaz.shapes.Lines(parsedPts, {
          closed: isClosed,
        });
      },
    );
  }

  private rectangle(rect: ISpec.RectangleSpec): Shape {
    return this.$build(rect, ({ width, height, deleteSide }, scope) => {
      return new Pacsaz.shapes.Rectangle(
        this.$parseMathStr(width, scope),
        this.$parseMathStr(height, scope),
        { deleteSide },
      );
    });
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
    return this.$build(polygon, ({ radius, sides }, scope) => {
      return new Pacsaz.shapes.Polygon(
        this.$parseMathStr(radius, scope),
        +sides,
        undefined,
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
    // Resolve the scope once: `isHidden` needs it per node, and the getter
    // re-evaluates every variable through mathjs on each access.
    const scope = this.scope;

    for (const node of this.nodes) {
      this.renderNode(node, scope);
    }
  }

  /**
   * Rulers are their own layer. The overall width/height ruler is always built (it
   * opts out internally when the setting is off); each stored ruler adds a
   * `DielineRuler` keyed by its own key.
   */
  override drawRulers() {
    this.$pushRuler({
      overall: new Pacsaz.ruler.OverallRuler(this.trimModel),
    });

    const scope = this.scope;

    for (const ruler of this.rulers) {
      if (this.isHidden(ruler, scope)) continue;

      this.$pushRuler({
        [ruler.key]: new Pacsaz.ruler.DielineRuler(
          this.$point(ruler.from, scope),
          this.$point(ruler.to, scope),
          this.$parseMathStr(ruler.value, scope),
          this.$parseMathStr(ruler.offset, scope),
        ),
      });
    }
  }

  /** Parses a stored point through the given variable scope. */
  private $point(point: ISpec.Point, scope: Record<string, number>): M.IPoint {
    return [
      this.$parseMathStr(point[0], scope),
      this.$parseMathStr(point[1], scope),
    ];
  }

  /**
   * Resolves a node's visibility from its own `hidden` flag plus its rules.
   *
   * Rules are applied **in order and the last match wins**, which is what lets a
   * `show` rule undo an earlier `hide`:
   *
   *   if width > 100 -> hide
   *   if width > 130 -> show
   *
   * A broken expression counts as "does not match" rather than failing the whole
   * render — one bad rule should not take the dieline down.
   */
  private isHidden(
    node: ISpec.Node | ISpec.Ruler,
    scope: Record<string, number>,
  ): boolean {
    // The node's own flag is the starting point; rules then decide from there.
    let hidden = node.hidden;

    for (const rule of node.rules ?? []) {
      try {
        if (!evaluate(normalizeCondition(rule.condition), scope)) continue;
      } catch {
        continue;
      }

      hidden = rule.action === "hide";
    }

    return hidden;
  }

  private renderNode(node: ISpec.Node, scope: Record<string, number>) {
    if (this.isHidden(node, scope)) return;

    if (node.type === "group") {
      this.$pushParts(node.id, this.$buildGroup(node, scope));
      return;
    }

    if (node.type === "model") {
      this.$pushModelNode(node);
      return;
    }

    const shape = this.$buildShape(node);
    Pacsaz.shape.push(this[`${node.layer}Model`], node.id, shape);
  }

  /** Routes the geometry of one node into the model for each layer it uses. */
  private $pushParts(nodeId: string, parts: LayerPart[]) {
    for (const layer of LAYERS) {
      const models = parts
        .filter((part) => part.layer === layer)
        .map((part) => part.model);

      if (models.length === 0) continue;

      Pacsaz.shape.push(
        this[`${layer}Model`],
        nodeId,
        models.length === 1 ? models[0]! : models,
      );
    }
  }

  private $pushModelNode(node: ISpec.Model) {
    const built = this.$buildModel(node);

    // The wrapper's own origin is inert (makerjs only moves the container), so the
    // recorded origin has to be applied to the real geometry inside it.
    const shift = this.$modelOrigin(node);

    const layers = this.$modelLayers(built);

    if (!layers) {
      Pacsaz.shape.push(this.trimModel, node.id, built);
      return;
    }

    if (layers.trims) {
      if (shift) M.model.move(layers.trims, shift);
      Pacsaz.shape.push(this.trimModel, node.id, layers.trims);
    }

    if (layers.folds) {
      if (shift) M.model.move(layers.folds, shift);
      Pacsaz.shape.push(this.foldModel, node.id, layers.folds);
    }
  }

  private $modelLayers(
    built: Shape,
  ): { trims?: M.IModel; folds?: M.IModel } | null {
    const wrapperKey = Object.keys(built.models ?? {})[0];
    const nested = wrapperKey ? built.models![wrapperKey]?.models : undefined;

    if (!nested) return null;

    const trims = nested["trims"];
    const folds = nested["folds"];

    return {
      trims: trims && hasGeometry(trims) ? trims : undefined,
      folds: folds && hasGeometry(folds) ? folds : undefined,
    };
  }

  /** Resolved node origin, or null when it is a no-op. */
  private $modelOrigin(node: ISpec.Model): M.IPoint | null {
    const x = this.$parseMathStr(node.origin[0], this.scope);
    const y = this.$parseMathStr(node.origin[1], this.scope);

    return x || y ? [x, y] : null;
  }

  /** Instantiates the model class for a node from its stored params. */
  private $buildModel(node: ISpec.Model): Shape {
    const scope = this.scope;

    let model: Shape;
    switch (node.modelKey) {
      case "glue": {
        const p = node.params as ISpec.ModelParams["glue"];
        model = new Pacsaz.models.Glue(
          [
            this.$parseMathStr(p.from[0], scope),
            this.$parseMathStr(p.from[1], scope),
          ],
          [
            this.$parseMathStr(p.to[0], scope),
            this.$parseMathStr(p.to[1], scope),
          ],
        );
        break;
      }

      case "door": {
        const p = node.params as ISpec.ModelParams["door"];
        model = new Pacsaz.models.Door(p.dustSide, p.indentAt);
        if (p.mirror) {
          model.mirror(p.mirror.x, p.mirror.y);
        }
        break;
      }

      case "hole": {
        const p = node.params as ISpec.ModelParams["hole"];
        model = new Pacsaz.models.Hole(
          p.angleBetweenStartAndEnd,
          this.$parseMathStr(p.heightOfLine, scope),
          p.rotation,
          p.handleDir,
        );
        break;
      }

      case "snapLock":
        model = new Pacsaz.models.SnapLock();
        break;
    }

    this.$applyDup(model, node.dup, scope);

    return model;
  }

  /** Flattens one child into layer-tagged parts, applying its visibility. */
  private $flattenChild(
    child: ISpec.Node,
    scope: Record<string, number>,
  ): LayerPart[] {
    if (this.isHidden(child, scope)) return [];
    if (child.type === "group") return this.$buildGroup(child, scope);
    if (child.type === "model") return this.$buildModelParts(child);
    return [{ layer: child.layer, model: this.$buildShape(child) }];
  }

  /**
   * Trim / fold halves of a model node, each tagged with the layer it belongs to.
   */
  private $buildModelParts(node: ISpec.Model): LayerPart[] {
    const built = this.$buildModel(node);

    const shift = this.$modelOrigin(node);
    const layers = this.$modelLayers(built);

    if (!layers) {
      if (shift) M.model.move(built, shift);
      return [{ layer: "trim", model: built }];
    }

    const parts: LayerPart[] = [];

    if (layers.trims) {
      if (shift) M.model.move(layers.trims, shift);
      parts.push({ layer: "trim", model: layers.trims });
    }

    if (layers.folds) {
      if (shift) M.model.move(layers.folds, shift);
      parts.push({ layer: "fold", model: layers.folds });
    }

    if (parts.length === 0) {
      if (shift) M.model.move(built, shift);
      parts.push({ layer: "trim", model: built });
    }

    return parts;
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

  /**
   * Builds a group as layer-tagged parts. A group may mix layers (e.g. a trim
   * line and a fold line), so the layer of every child is preserved instead of
   * collapsing the whole group into one layer.
   */
  private $buildGroup(
    group: ISpec.Group,
    scope: Record<string, number>,
  ): LayerPart[] {
    let parts: LayerPart[] = [];
    for (const child of group.nodes) {
      // `$flattenChild` applies visibility (manual + rules) for each child.
      parts.push(...this.$flattenChild(child, scope));
    }

    const resolved = this.$resolveEffects(group.effects, scope) ?? [];

    const combiners = resolved.filter(
      (e) => e.type === "join" || e.type === "boolean",
    );
    const modifiers = resolved.filter(
      (e) => e.type === "radius" || e.type === "radiusAt" || e.type === "array",
    );

    // Cross-layer dup mirrors the whole group, so it is applied to the assembled
    // geometry before the layers are separated.
    let assembled: M.IModel = {
      models: Object.fromEntries(parts.map((p, i) => [`child-${i}`, p.model])),
    };

    this.$applyDup(assembled, group.dup, scope);

    const layers = new Set(parts.map((part) => part.layer));

    // Join / boolean produce a single merged model, which only makes sense while
    // one layer is involved. Across layers it would be undecidable where the
    // merged geometry belongs, so the parts are kept intact instead of losing
    // their layer assignment.
    if (combiners.length > 0 && layers.size === 1) {
      const models = parts.map((part) => part.model);

      for (const efx of combiners) {
        switch (efx.type) {
          case "join":
            assembled = applyJoin(models, efx.mode);
            break;
          case "boolean":
            assembled = applyBoolean(models, efx.mode);
            break;
        }
      }

      parts = [{ layer: parts[0]!.layer, model: assembled }];
    }

    // Modifiers act per model, so they are safe to apply within each layer.
    // Shapes go through this same helper via `$build`.
    for (const part of parts) {
      part.model = this.$applyEffects(part.model, modifiers);
    }

    return parts;
  }
  //! ------------------------ Utils ------------------------

  private $build<T extends ShapeNode>(
    item: T,
    callBack: (val: T, scope: Record<string, number>) => Shape,
  ): Shape {
    const scope = this.scope;
    const base = callBack(item, scope);

    // Effects belong to the engine, not to the shape classes: the shape only
    // produces geometry, and everything after that is applied here so all shapes
    // share one implementation.
    const shaped = this.$applyEffects(
      base,
      this.$resolveEffects(item.effects, scope),
    );

    return this.$finishShape(shaped, item, scope);
  }

  /** Applies the shape-level effects (radius, radiusAt, array) to a model. */
  private $applyEffects(
    model: M.IModel,
    effects: ISpec.ShapeEffect[] | undefined,
  ): M.IModel {
    let result = model;

    for (const effect of effects ?? []) {
      switch (effect.type) {
        case "radius":
          result = addFillet(result, +effect.value);
          break;

        case "radiusAt":
          result = addFilletAt(
            result,
            effect.targets.map((t) => Number(t)),
            +effect.value,
          );
          break;

        case "array":
          result = applyArray(result, effect);
          break;
      }
    }

    return result;
  }

  /** Places a built shape at its origin and applies its dup operations. */
  private $finishShape<T extends ShapeNode>(
    model: M.IModel,
    item: T,
    scope: Record<string, number>,
  ): Shape {
    // Effects return plain models, so the geometry is re-wrapped to keep the
    // `Shape` chain (`dup`, `mirror`, ...) that the dup operations rely on.
    const shape =
      model instanceof Shape ? model : new Pacsaz.shape.ToShape(model);

    shape.moveTo([
      this.$parseMathStr(item.origin[0], scope),
      this.$parseMathStr(item.origin[1], scope),
    ]);

    this.$applyDup(shape, item.dup, scope);

    return shape;
  }

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
