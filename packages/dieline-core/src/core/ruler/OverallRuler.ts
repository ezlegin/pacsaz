import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";
import { Ruler } from "./Ruler";

export class OverallRuler extends Ruler {
  constructor(private trimModel: IModel) {
    super();

    const { showOverallRulers } = getDielineSettings();
    if (!showOverallRulers) {
      delete this.models?.overallRuler;
      return this;
    }

    const trimSize = M.measure.modelExtents(this.trimModel);
    if (!trimSize) throw new Error("Sizes not available. [OverallRuler]");

    const padding = 20;
    const indctrOffset = 3;

    const heightRuler = this.ruler(
      [trimSize.low[0]! - padding, trimSize.low[1]!],
      [trimSize.low[0]! - padding, trimSize.high[1]!],
      +trimSize.height.toFixed(1),
      "overallRulerText",
    );

    const heightIndctr = new Pacsaz.shapes.Line(padding - 4)
      .moveTo([trimSize.low[0]! - padding + indctrOffset, trimSize.low[1]!])
      .dup()
      .moveTo([trimSize.low[0]! - padding + indctrOffset, trimSize.high[1]!]);

    const widthRuler = this.ruler(
      [trimSize.low[0]!, trimSize.low[1]! - padding],
      [trimSize.high[0]!, trimSize.low[1]! - padding],
      +trimSize.width.toFixed(1),
      "overallRulerText",
    );

    const widthIndctr = new Pacsaz.shapes.Line(padding - 4, 90)
      .moveTo([trimSize.low[0]!, trimSize.low[1]! - padding + indctrOffset])
      .dup()
      .moveTo([trimSize.high[0]!, trimSize.low[1]! - padding + indctrOffset]);

    Pacsaz.shape.push(this, "overallRuler", {
      models: {
        heightRuler,
        heightIndctr,
        widthRuler,
        widthIndctr,
      },
    });
  }
}
