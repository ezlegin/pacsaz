import M from "makerjs";

export type Point = [number, number];

export interface GuideLineOptions {
  type: "width" | "length" | "height";
  from: Point;
  to: Point;
  value: number;
  orientation: "horizontal" | "vertical";
}

export function addGuideLine(model: M.IModel, options: GuideLineOptions) {
  const { type, from, to, value, orientation } = options;

  // guide line
  const guideLine = new M.models.ConnectTheDots(false, [from, to]);
  model.models![`${type}Line`] = guideLine;
  model.models![`${type}Line`]!.layer = `${type}GuideLine`;

  // arrow pointer
  const basePointer = new M.models.Polygon(3, 1.2);

  const startPointer = M.cloneObject(basePointer);
  const endPointer = M.cloneObject(basePointer);

  if (orientation === "horizontal") {
    M.model.rotate(startPointer, 180);
    M.model.move(startPointer, [from[0] + 1.2, from[1]]);
    M.model.move(endPointer, [to[0] - 1.2, to[1]]);
  } else {
    M.model.rotate(startPointer, -90);
    M.model.move(startPointer, [from[0], from[1] + 1.2]);
    M.model.rotate(endPointer, 90);
    M.model.move(endPointer, [to[0], to[1] - 1.2]);
  }

  model.models![`${type}StartPointer`] = startPointer;
  model.models![`${type}StartPointer`]!.layer = `pointer`;
  model.models![`${type}EndPointer`] = endPointer;
  model.models![`${type}EndPointer`]!.layer = `pointer`;

  // text anchor
  const mid: Point = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

  const textCarrier = M.cloneObject(guideLine);
  M.model.addCaption(textCarrier, `${value} mm`, mid);

  model.models![`${type}Text`] = textCarrier;
  model.models![`${type}Text`]!.layer = `${type}GuideText`;

  // optional background box
  const box = new M.models.Rectangle(18, 6);
  M.model.move(box, [mid[0] - 9, mid[1] - 3]);
  model.models![`${type}Box`] = box;
  model.models![`${type}Box`]!.layer = `${type}GuideBox`;
}
