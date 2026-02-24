import { getDevCTX } from "@repo/store/dieline/developerTools.store";
import M, { IModel } from "makerjs";
import Pacsaz from "../Pacsaz";
import { containerSize } from "../../data/consts";

export class Container implements IModel {
  constructor(trimModel: IModel) {
    if (!trimModel.models) {
      return;
    }

    const extended = M.measure.modelExtents(trimModel)!;
    if (!extended) return;
    const { low, high } = extended;

    const minX = low[0]!;
    const minY = low[1]!;
    const maxX = high[0]!;
    const maxY = high[1]!;

    const container = M.model.outline(
      new M.models.ConnectTheDots(true, [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
      ]),
      getDevCTX().showContainer ? containerSize : 6,
      1,
      false,
    );

    Pacsaz.shape.push(this, "container", container, "container", true);
  }
}
