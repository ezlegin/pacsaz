import { getOverallSizes } from "@repo/store/dieline/overallSize.store";
import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";

export class OverallRuler extends Ruler {
  constructor() {
    super();

    const { showOverallDimensions } = getDevCTX();
    if (!showOverallDimensions) {
      delete this.models?.overallRuler;
      return this;
    }

    const trimSize = getOverallSizes().trim;
    if (!trimSize) throw new Error("Trim size not available. [overallRuler()]");

    const padding = 20;

    const heightRuler = this.ruler(
      [-padding, 0],
      [-padding, trimSize.height],
      trimSize.height,
      "overallRulerText",
    );

    const heightIndicator = new Pacsaz.shapes.Line(padding)
      .move([-padding - 2, 0])
      .dup()
      .moveTo([0, trimSize.height]);

    const widthRuler = this.ruler(
      [0, -padding],
      [trimSize.width, -padding],
      trimSize.width,
      "overallRulerText",
    );

    const widthIndicator = new Pacsaz.shapes.Line(
      padding,

      90,
    )
      .move([0, -padding - 2])
      .dup()
      .moveTo([trimSize.width, 0]);

    Pacsaz.shape.push(this, "overallRuler", {
      models: {
        widthRuler,
        widthIndicator,
        heightRuler,
        heightIndicator,
      },
    });
  }
}
