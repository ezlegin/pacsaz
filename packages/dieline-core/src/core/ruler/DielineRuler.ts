import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";

export class DielineRuler extends Ruler {
  constructor(
    private width: number,
    private length: number,
  ) {
    super();
    const { dimensionType } = getDielineSettings();
    const offset = this.$offset(dimensionType);

    const points = {
      length: {
        from: [this.width / 4, offset],
        to: [this.width / 4, this.length - offset],
      },
      width: {
        from: [offset, this.length / 4],
        to: [this.width - offset, this.length / 4],
      },
      //todo: add height
    };

    const lengthRuler = this.ruler(
      points.length.from,
      points.length.to,
      this.length,
    );

    const widthRuler = this.ruler(
      points.width.from,
      points.width.to,
      this.width,
    );

    Pacsaz.shape.push(this, "dielineRuler", {
      models: { lengthRuler, widthRuler },
    });
  }

  protected override get offsetAmount(): number {
    return this.width * 0.02;
  }
}
