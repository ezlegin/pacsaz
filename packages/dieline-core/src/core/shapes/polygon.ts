import M, { IModel, IPoint } from "makerjs";
import { Shape } from "./shape";

export class Polygon extends Shape {
  constructor(sides: number, radius: number) {
    super();

    const polygon = new M.models.Polygon(sides, radius);
    const angleOfRoation = () => {
      if (sides < 3) throw new Error("Minimum sides is 3 for polygon.");
      if (sides === 3) return -30;
      if (sides === 4) return 45;
      if (sides === 5) return 18;
      if (sides === 6) return -60;
      return -13; // 7
    };
    M.model.rotate(polygon, angleOfRoation(), [0, 0]);
    M.model.originate(polygon);

    console.log(polygon);

    this.$addToModel(polygon, "polygon");
  }

  protected override $getOriginForMirror(): IPoint | undefined {
    console.log(this.lastModel);
    return this.lastModel.origin;
  }

  override originate(pts: IPoint): this {
    M.model.move(this.lastModel, pts);
    return this;
  }
}
