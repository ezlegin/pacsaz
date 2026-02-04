import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import { Shape } from "../shapes/Shape";
import M, { IModel } from "makerjs";

export class Model extends Shape {
  protected get settings() {
    return getDielineSettings();
  }
  protected get width() {
    return this.settings.dimension.resolved.width;
  }
  protected get length() {
    return this.settings.dimension.resolved.length;
  }
  protected get height() {
    return this.settings.dimension.resolved.height;
  }
  protected get safeFoldOffset() {
    return this.settings.safeFoldOffset;
  }
  protected get thickness() {
    return this.settings.thickness;
  }

  override move(pts: MakerJs.IPoint): this {
    M.model.moveRelative(this, pts);
    return this;
  }

  override rotate(angle: number, rotaionOrigin?: M.IPoint): this {
    M.model.rotate(this, angle, rotaionOrigin ?? this.size?.center);
    return this;
  }

  $pushModel(trims: Record<string, IModel>, folds?: Record<string, IModel>) {
    this.models = { trims: { models: trims }, folds: { models: folds } };
  }
}
