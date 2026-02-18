import M, { IModel, IPoint } from "makerjs";

type MirrorRefPoint = "top" | "bottom" | "left" | "right";
type RotateRefPoint =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

export abstract class Shape implements IModel {
  models: M.IModelMap = {};

  dup(): this {
    const duplicated = M.model.clone(this.lastModel);
    this.$addToModel(duplicated, "dup");
    return this;
  }

  moveTo(pts: IPoint): this {
    M.model.move(this.lastModel, pts);
    return this;
  }

  mirror(x: boolean, y: boolean, refPoint?: MirrorRefPoint): this {
    const origin = this.lastModel?.origin;
    if (!origin) throw new Error("Origin not provided. [mirror()]");

    const mirrored = M.model.mirror(this.lastModel, x, y);
    M.model.center(mirrored);
    M.model.moveRelative(mirrored, this.size.center);

    let moveTo: IPoint = [0, 0];
    switch (refPoint) {
      case "right":
        moveTo = x ? [this.size.width, 0] : [0, 0];
        break;
      case "left":
        moveTo = x ? [-this.size.width, 0] : [0, 0];
        break;
      case "top":
        moveTo = y ? [0, this.size.height] : [0, 0];
        break;
      case "bottom":
        moveTo = y ? [0, -this.size.height] : [0, 0];
        break;
    }
    M.model.moveRelative(mirrored, moveTo);

    this.$addToModel(mirrored, this.lastModelKey, true);
    return this;
  }

  move(pts: IPoint): this {
    M.model.moveRelative(this.lastModel, pts);
    return this;
  } //todo: use circle originate as default and use this originate only for Line.

  zero(): this {
    M.model.zero(this.lastModel);
    return this;
  }

  center(): this {
    M.model.center(this.lastModel);
    return this;
  }

  scale(amount: number): this {
    M.model.scale(this.lastModel, amount);
    return this;
  }

  rotate(angle: number, refPoint?: RotateRefPoint): this {
    let referencePoint: IPoint = [0, 0];
    switch (refPoint) {
      case "bottom-right":
        referencePoint = [this.size.high[0]!, this.size.low[1]!];
        break;
      case "bottom-left":
        referencePoint = [this.size.low[0]!, this.size.low[1]!];
        break;
      case "top-right":
        referencePoint = [this.size.high[0]!, this.size.high[1]!];
        break;
      case "top-left":
        referencePoint = [this.size.low[0]!, this.size.high[1]!];
        break;
      case "bottom":
        referencePoint = [this.size.center[0]!, this.size.low[1]!];
        break;
      case "top":
        referencePoint = [this.size.center[0]!, this.size.high[1]!];
        break;
      case "left":
        referencePoint = [this.size.low[0]!, this.size.center[1]!];
        break;
      case "right":
        referencePoint = [this.size.high[0]!, this.size.center[1]!];
        break;
      default:
        referencePoint = this.size?.center;
        break;
    }

    M.model.rotate(this.lastModel, angle, referencePoint);
    return this;
  }

  get size(): M.IMeasureWithCenter {
    const size = M.measure.modelExtents(this.lastModel);
    if (!size) throw new Error("Size could not Processed. [size()]");
    return size;
  }

  // -------------------- UTILS --------------------

  protected $registerModel(key: string, model: IModel) {
    if (!this.models) this.models = {};
    this.models[key] = model;
  }

  protected $addToModel(child: IModel, key: string, overwrite?: boolean) {
    M.model.addTo(child, this, key, overwrite);
  }

  protected get lastModelKey() {
    if (!this.models)
      throw new Error("Model not initialized. [lastModelKey()]");

    const modelsKeys = Object.keys(this.models);
    const duppedKeys = modelsKeys.filter((k) => k.includes("dup"));
    const lastKey = (duppedKeys.length === 0 ? modelsKeys : duppedKeys).at(-1)!;

    return lastKey;
  }

  protected get lastModel() {
    return this.models![this.lastModelKey]!;
  }
}
