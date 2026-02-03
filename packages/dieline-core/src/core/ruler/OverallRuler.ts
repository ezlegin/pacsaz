import { getDevCTX } from "@repo/store/dieline/useDeveloperToolsStore";
import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";
import { getOverallSizes } from "@repo/store/dieline/overallSize.store";
import { Ruler } from "./Ruler";

export class OverallRuler extends Ruler implements IModel {
  models?: M.IModelMap | undefined;

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

    const height = this.ruler(
      [-padding, 0],
      [-padding, trimSize.height],
      trimSize.height,
      "overallRulerText",
    );

    const heightIndicator = new Pacsaz.shapes.Line(padding, [-padding - 2, 0])
      .duplicate()
      .move([0, trimSize.height]);

    const width = this.ruler(
      [0, -padding],
      [trimSize.width, -padding],
      trimSize.width,
      "overallRulerText",
    );

    const widthIndicator = new Pacsaz.shapes.Line(
      padding,
      [0, -padding - 2],
      90,
    )
      .duplicate()
      .move([trimSize.width, 0]);

    Pacsaz.shape.push(this, "overallRuler", {
      models: { height, width, widthIndicator, heightIndicator },
    });
  }
}
