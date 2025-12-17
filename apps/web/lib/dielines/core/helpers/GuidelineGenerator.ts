import M from "makerjs";
import { ptToMm } from "../../../../utils/sizeConvertor";
import { DimensionType, applyDimensionOffset } from "./applyDimensionOffset";

type Point = [number, number];

export interface GuideLineOptions {
  type: "width" | "length" | "height";
  from: Point;
  to: Point;
  value: number;
  orientation: "horizontal" | "vertical";
  dimensionType: DimensionType;
  dimensionTypeOffset: number;
}

export function addGuideLine(model: M.IModel, options: GuideLineOptions) {
  const {
    type,
    from,
    to,
    value,
    orientation,
    dimensionType,
    dimensionTypeOffset: offset,
  } = options;

  const pointerRadius = 4;
  const indicatorLength = 4;

  const basePointer = new M.models.Polygon(3, pointerRadius);
  const startPointer = M.cloneObject(basePointer);
  const endPointer = M.cloneObject(basePointer);

  if (orientation === "horizontal") {
    const textBoxSize = 25;

    const startX = applyDimensionOffset(from[0], dimensionType, offset);
    const endX = applyDimensionOffset(to[0], dimensionType, -offset);

    // indicators
    model.models![`${type}StartIndicator`] = new M.models.ConnectTheDots(
      false,
      [
        [startX, from[1] + indicatorLength],
        [startX, from[1] - indicatorLength],
      ]
    );
    model.models![`${type}EndIndicator`] = new M.models.ConnectTheDots(false, [
      [endX, to[1] + indicatorLength],
      [endX, to[1] - indicatorLength],
    ]);

    // guide lines
    model.models![`${type}LineBefore`] = new M.models.ConnectTheDots(false, [
      [startX, from[1]],
      [to[0] / 2 - textBoxSize, to[1]],
    ]);
    model.models![`${type}LineAfter`] = new M.models.ConnectTheDots(false, [
      [to[0] / 2 + textBoxSize, to[1]],
      [endX, to[1]],
    ]);

    // pointers
    M.model.rotate(startPointer, 180);
    M.model.move(startPointer, [
      applyDimensionOffset(from[0] + pointerRadius, dimensionType, offset),
      from[1],
    ]);

    M.model.move(endPointer, [
      applyDimensionOffset(to[0] - pointerRadius, dimensionType, -offset),
      to[1],
    ]);
  } else {
    // vertical
    const textBoxSize = 10;

    const startY = applyDimensionOffset(from[1], dimensionType, offset);
    const endY = applyDimensionOffset(to[1], dimensionType, -offset);

    model.models![`${type}StartIndicator`] = new M.models.ConnectTheDots(
      false,
      [
        [from[0] - indicatorLength, startY],
        [from[0] + indicatorLength, startY],
      ]
    );

    model.models![`${type}EndIndicator`] = new M.models.ConnectTheDots(false, [
      [to[0] - indicatorLength, endY],
      [to[0] + indicatorLength, endY],
    ]);

    model.models![`${type}LineBefore`] = new M.models.ConnectTheDots(false, [
      [from[0], startY],
      [from[0], to[1] / 2 - textBoxSize],
    ]);

    model.models![`${type}LineAfter`] = new M.models.ConnectTheDots(false, [
      [to[0], to[1] / 2 + textBoxSize],
      [to[0], endY],
    ]);

    M.model.rotate(startPointer, -90);
    M.model.move(startPointer, [
      from[0],
      applyDimensionOffset(from[1] + pointerRadius, dimensionType, offset),
    ]);

    M.model.rotate(endPointer, 90);
    M.model.move(endPointer, [
      to[0],
      applyDimensionOffset(to[1] - pointerRadius, dimensionType, -offset),
    ]);
  }

  // layers
  Object.keys(model.models!).forEach((key) => {
    if (key.includes("Indicator") || key.includes("Line")) {
      model.models![key]!.layer = "guideLine";
    }
  });

  model.models![`${type}StartPointer`] = startPointer;
  model.models![`${type}StartPointer`]!.layer = "pointer";

  model.models![`${type}EndPointer`] = endPointer;
  model.models![`${type}EndPointer`]!.layer = "pointer";

  // text
  const mid: Point = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
  M.model.addCaption(textCarrier, `${ptToMm(value)} mm`, mid);

  model.models![`${type}Text`] = textCarrier;
  model.models![`${type}Text`]!.layer = "guideText";
}
