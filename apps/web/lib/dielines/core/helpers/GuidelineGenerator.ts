import M from "makerjs";
import { ptToMm } from "../../../../utils/sizeConvertor";
import { DimensionsTypeOffset as offset } from "../consts";

type Point = [number, number];

export interface GuideLineOptions {
  type: "width" | "length" | "height";
  from: Point;
  to: Point;
  value: number;
  orientation: "horizontal" | "vertical";
  isInnerDimension: boolean;
  isOuterDimension: boolean;
}

export function addGuideLine(model: M.IModel, options: GuideLineOptions) {
  const {
    type,
    from,
    to,
    value,
    orientation,
    isInnerDimension,
    isOuterDimension,
  } = options;

  // arrow pointer
  const pointerRadius = 4;
  const indicatorLength = 4;
  const basePointer = new M.models.Polygon(3, pointerRadius);

  const startPointer = M.cloneObject(basePointer);
  const endPointer = M.cloneObject(basePointer);

  if (orientation === "horizontal") {
    const textBoxSize = 25;

    const startIndicator = new M.models.ConnectTheDots(false, [
      [
        isInnerDimension
          ? from[0] + offset
          : isOuterDimension
            ? from[0] - offset
            : from[0],
        from[1] + indicatorLength,
      ],
      [
        isInnerDimension
          ? from[0] + offset
          : isOuterDimension
            ? from[0] - offset
            : from[0],
        from[1] - indicatorLength,
      ],
    ]);
    model.models![`${type}StartIndicator`] = startIndicator;
    model.models![`${type}StartIndicator`]!.layer = `guideLine`;

    const endIndicator = new M.models.ConnectTheDots(false, [
      [
        isInnerDimension
          ? to[0] - offset
          : isOuterDimension
            ? to[0] + offset
            : to[0],
        to[1] + indicatorLength,
      ],
      [
        isInnerDimension
          ? to[0] - offset
          : isOuterDimension
            ? to[0] + offset
            : to[0],
        to[1] - indicatorLength,
      ],
    ]);
    model.models![`${type}EndIndicator`] = endIndicator;
    model.models![`${type}EndIndicator`]!.layer = `guideLine`;

    const guideLineBefore = new M.models.ConnectTheDots(false, [
      [
        isInnerDimension
          ? from[0] + offset
          : isOuterDimension
            ? -offset
            : from[0],
        from[1],
      ],
      [to[0] / 2 - textBoxSize, to[1]],
    ]);
    model.models![`${type}LineBefore`] = guideLineBefore;
    model.models![`${type}LineBefore`]!.layer = `guideLine`;

    const guideLineAfter = new M.models.ConnectTheDots(false, [
      [to[0] / 2 + textBoxSize, to[1]],
      [
        isInnerDimension
          ? to[0] - offset
          : isOuterDimension
            ? to[0] + offset
            : to[0],
        to[1],
      ],
    ]);
    model.models![`${type}LineAfter`] = guideLineAfter;
    model.models![`${type}LineAfter`]!.layer = `guideLine`;

    M.model.rotate(startPointer, 180);
    M.model.move(startPointer, [
      isInnerDimension
        ? from[0] + pointerRadius + offset
        : isOuterDimension
          ? from[0] + pointerRadius - offset
          : from[0] + pointerRadius,
      from[1],
    ]);
    M.model.move(endPointer, [
      isInnerDimension
        ? to[0] - pointerRadius - offset
        : isOuterDimension
          ? to[0] - pointerRadius + offset
          : to[0] - pointerRadius,
      to[1],
    ]);
  } else {
    // Vertical guide line
    const textBoxSize = 10;

    const startIndicator = new M.models.ConnectTheDots(false, [
      [
        from[0] - indicatorLength,
        isInnerDimension
          ? from[1] + offset
          : isOuterDimension
            ? from[1] - offset
            : from[1],
      ],
      [
        from[0] + indicatorLength,
        isInnerDimension
          ? from[1] + offset
          : isOuterDimension
            ? from[1] - offset
            : from[1],
      ],
    ]);
    model.models![`${type}StartIndicator`] = startIndicator;
    model.models![`${type}StartIndicator`]!.layer = `guideLine`;

    const endIndicator = new M.models.ConnectTheDots(false, [
      [
        to[0] - indicatorLength,
        isInnerDimension
          ? to[1] - offset
          : isOuterDimension
            ? to[1] + offset
            : to[1],
      ],
      [
        to[0] + indicatorLength,
        isInnerDimension
          ? to[1] - offset
          : isOuterDimension
            ? to[1] + offset
            : to[1],
      ],
    ]);
    model.models![`${type}EndIndicator`] = endIndicator;
    model.models![`${type}EndIndicator`]!.layer = `guideLine`;

    const guideLineBefore = new M.models.ConnectTheDots(false, [
      [
        from[0],
        isInnerDimension
          ? from[1] + offset
          : isOuterDimension
            ? -offset
            : from[1],
      ],
      [from[0], to[1] / 2 - textBoxSize],
    ]);
    model.models![`${type}LineBefore`] = guideLineBefore;
    model.models![`${type}LineBefore`]!.layer = `guideLine`;

    const guideLineAfter = new M.models.ConnectTheDots(false, [
      [to[0], to[1] / 2 + textBoxSize],
      [
        to[0],
        isInnerDimension
          ? to[1] - offset
          : isOuterDimension
            ? to[1] + offset
            : to[1],
      ],
    ]);
    model.models![`${type}LineAfter`] = guideLineAfter;
    model.models![`${type}LineAfter`]!.layer = `guideLine`;

    // Start pointer (bottom → up)
    M.model.rotate(startPointer, -90);
    M.model.move(startPointer, [
      from[0],
      isInnerDimension
        ? from[1] + pointerRadius + offset
        : isOuterDimension
          ? from[1] + pointerRadius - offset
          : from[1] + pointerRadius,
    ]);

    // End pointer (top → down)
    M.model.rotate(endPointer, 90);
    M.model.move(endPointer, [
      to[0],
      isInnerDimension
        ? to[1] - pointerRadius - offset
        : isOuterDimension
          ? to[1] - pointerRadius + offset
          : to[1] - pointerRadius,
    ]);
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
