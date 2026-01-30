import M, { IModel, IPath, IPoint } from "makerjs";

interface Pacsaz extends IModel {
  zero(): this;
  duplicate(): this;
  move(pts: IPoint): this;
  mirror(x: boolean, y: boolean): this;
  originate(pts: IPoint): this;
  center(): this;
}

export abstract class Shape implements Pacsaz {
  models?: M.IModelMap = {};

  protected $registerModel(key: string, model: IModel) {
    if (!this.models) this.models = {};
    this.models[key] = model;
  }

  protected $addToModel(child: IModel, key: string, overwrite?: boolean) {
    M.model.addTo(child, this, key, overwrite);
  }
  protected $addPathToModel(child: IPath, key: string, overwrite?: boolean) {
    M.path.addTo(child, this, key, overwrite);
  }

  protected $getOriginForMirror(): IPoint | undefined {
    return (
      this.lastModel?.paths?.ShapeLine1?.origin ??
      this.lastModel?.paths?.line?.origin ??
      undefined
    );
  }

  protected get lastModelKey(): string {
    if (!this.models) throw new Error("Model not initialized.");
    const keys = Object.keys(this.models);
    return keys.at(-1)!;
  }

  protected get lastModel(): any {
    return this.models![this.lastModelKey];
  }

  duplicate(): this {
    const cloned = M.model.clone(this.lastModel);
    this.$addToModel(cloned, "line");
    return this;
  }

  move(pts: IPoint): this {
    M.model.moveRelative(this.lastModel, pts);
    return this;
  }

  mirror(x: boolean, y: boolean): this {
    const origin = this.$getOriginForMirror();
    if (!origin) throw new Error("Origin not provided. [mirror()]");

    const mirrored = M.model.move(M.model.mirror(this.lastModel, x, y), [
      x ? origin[0]! * 2 : 0,
      y ? origin[1]! * 2 : 0,
    ]);

    this.$addToModel(mirrored, this.lastModelKey, true);
    return this;
  }

  originate(pts: IPoint): this {
    M.model.zero(this.lastModel);
    M.model.moveRelative(this.lastModel, pts);
    return this;
  }

  zero(): this {
    M.model.zero(this.lastModel);
    return this;
  }

  center(): this {
    M.model.center(this.lastModel);
    return this;
  }
}
