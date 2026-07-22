import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import M, { IPoint } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";

export class DielineRuler extends Ruler {
  constructor(
    from: IPoint,
    to: IPoint,
    value: number,
    private offsetAmount = 0,
  ) {
    super();
    const temp = new M.paths.Line(from, to);
    const center = M.point.middle(temp);
    M.path.scale(temp, 1.1);
    M.path.center(temp);
    M.path.moveRelative(temp, center);
    const radius = M.measure.pointDistance(from, to) / 2;
    const circle = new M.paths.Circle(radius - this.offset);
    M.model.move(circle, center);
    const { intersectionPoints } = M.path.intersection(temp, circle);

    const ruler = this.ruler(
      intersectionPoints[0]!,
      intersectionPoints[1]!,
      value,
    );

    Pacsaz.shape.push(
      this,
      "dielineRuler",
      {
        models: { ruler },
      },
      "dielineRuler",
    );
  }

  private get offset() {
    const { dimensionType } = getDielineSettings();
    switch (dimensionType) {
      case "manufacture":
        return 0;
      case "inner":
        return this.offsetAmount;
      case "outer":
        return -this.offsetAmount;
    }
  }
}
