import M from "makerjs";
import { ptToMm } from "../../../../utils/sizeConvertor";

type Point = [number, number];

export interface GuideLineOptions {
  type: "width" | "length" | "height";
  from: Point;
  to: Point;
  value: number;
  orientation: "horizontal" | "vertical";
}

export function addGuideLine(model: M.IModel, options: GuideLineOptions) {
  const { type, from, to, value, orientation } = options;

  // arrow pointer
  const pointerRadius = 3;
  const basePointer = new M.models.Polygon(3, pointerRadius);

  const startPointer = M.cloneObject(basePointer);
  const endPointer = M.cloneObject(basePointer);

  // Position Pointers
  if (orientation === "horizontal") {
    // Horizontal guide line
    const textBoxSize = 25;

    const guideLineBefore = new M.models.ConnectTheDots(false, [
      from,
      [to[0] / 2 - textBoxSize, to[1]],
    ]);
    model.models![`${type}LineBefore`] = guideLineBefore;
    model.models![`${type}LineBefore`]!.layer = `guideLine`;

    const guideLineAfter = new M.models.ConnectTheDots(false, [
      [to[0] / 2 + textBoxSize, to[1]],
      to,
    ]);
    model.models![`${type}LineAfter`] = guideLineAfter;
    model.models![`${type}LineAfter`]!.layer = `guideLine`;

    M.model.rotate(startPointer, 180);
    M.model.move(startPointer, [from[0] + pointerRadius, from[1]]);
    M.model.move(endPointer, [to[0] - pointerRadius, to[1]]);
  } else {
    // Vertical guide line
    const textBoxSize = 10;

    const guideLineBefore = new M.models.ConnectTheDots(false, [
      from,
      [from[0], to[1] / 2 - textBoxSize],
    ]);
    model.models![`${type}LineBefore`] = guideLineBefore;
    model.models![`${type}LineBefore`]!.layer = `guideLine`;

    const guideLineAfter = new M.models.ConnectTheDots(false, [
      [to[0], to[1] / 2 + textBoxSize],
      to,
    ]);
    model.models![`${type}LineAfter`] = guideLineAfter;
    model.models![`${type}LineAfter`]!.layer = `guideLine`;

    M.model.rotate(startPointer, -90);
    M.model.move(startPointer, [from[0], from[1] + pointerRadius]);
    M.model.rotate(endPointer, 90);
    M.model.move(endPointer, [to[0], to[1] - pointerRadius]);
  }

  model.models![`${type}StartPointer`] = startPointer;
  model.models![`${type}StartPointer`]!.layer = `pointer`;
  model.models![`${type}EndPointer`] = endPointer;
  model.models![`${type}EndPointer`]!.layer = `pointer`;

  // text anchor
  const mid: Point = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

  const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
  M.model.addCaption(textCarrier, `${ptToMm(value)} mm`, mid);

  model.models![`${type}Text`] = textCarrier;
  model.models![`${type}Text`]!.layer = `guideText`;
}
