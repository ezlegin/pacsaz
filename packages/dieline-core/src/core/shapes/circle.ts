import M, { IModel, IPoint } from "makerjs";
import { Shape } from "./Shape";

export class Circle extends Shape {
  constructor(radius: number, origin?: IPoint) {
    super();
    const circle = new M.paths.Circle(radius);
    const model: IModel = { paths: { circle } };
    if (origin) M.model.move(model, origin);
    this.$addToModel(model, "circle");
  }

  protected override $getOriginForMirror(): IPoint | undefined {
    return this.lastModel.paths?.circle?.origin;
  }

  override move(pts: IPoint): this {
    M.model.move(this.lastModel, pts);
    return this;
  }
}
