import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";
import { DimensionType } from "@repo/store/data/types";

export class DielineRuler extends Ruler {
  constructor(
    private width: number,
    private length: number,
    private height?: number,
  ) {
    super();
    const { dimensionType } = getDielineSettings();
    const offset = this.$offset(dimensionType);

    const widthY = this.length / 4;
    const heightY = this.length / 1.5;
    const lengthX = this.width * 2 + (this.height ?? 0) * 1.5;

    const coordinates = {
      length: {
        from: [lengthX, offset],
        to: [lengthX, this.length - offset],
      },
      width: {
        from: [offset, widthY],
        to: [this.width - offset, widthY],
      },
      height: {
        from: [this.width + offset, heightY],
        to: [this.width + (this.height ?? 0) - offset, heightY],
      },
      //todo: add height
    };

    const widthRuler = this.ruler(
      coordinates.width.from,
      coordinates.width.to,
      this.width,
    );

    const lengthRuler = this.ruler(
      coordinates.length.from,
      coordinates.length.to,
      this.length,
    );

    Pacsaz.shape.push(this, "dielineRuler", {
      models: { widthRuler, lengthRuler },
    });

    if (this.height) {
      const heightRuler = this.ruler(
        coordinates.height.from,
        coordinates.height.to,
        this.height,
      );
      this.models!["heightRuler"] = heightRuler;
    }
  }

  protected $offset(dimensionType: DimensionType) {
    const offsetAmount = this.width * 0.02;
    switch (dimensionType) {
      case "manufacture":
        return 0;
      case "inner":
        return offsetAmount;
      case "outer":
        return -offsetAmount;
    }
  }
}
