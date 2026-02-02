import M, { IPoint } from "makerjs";
import { Shape } from "./Shape";

export class Polygon extends Shape {
  constructor(sides: number, radius: number, firstCornerAngle?: number) {
    super();

    const polygon = new M.models.Polygon(sides, radius, firstCornerAngle ?? 90);
    this.$addToModel(polygon, "polygon");
  }

  protected override $getOriginForMirror(): IPoint | undefined {
    return this.lastModel.origin;
  }

  override originate(pts: IPoint): this {
    M.model.center(this.lastModel);
    M.model.move(this.lastModel, pts);
    return this;
  }
}
