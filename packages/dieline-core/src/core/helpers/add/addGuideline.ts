import { DimensionType } from "@repo/store/data/types";
import M, { IPoint } from "makerjs";
import { OffsetObject } from "../../../data/types";
import { applyDimensionOffset } from "../../../utils/applyDimensionOffset";
import P from "../../Pacsaz";

export interface GuideLineOptions {
  type: "width" | "length" | "height";
  from: IPoint;
  to: IPoint;
  orientation: "horizontal" | "vertical";
  dimensionType: DimensionType;
  dimensionTypeOffset: OffsetObject;
  dimType: "overall" | "partly";
  value: number;
}

export function addGuideLine(model: M.IModel, options: GuideLineOptions) {
  const {
    type,
    from,
    to,
    value,
    orientation,
    dimensionType,
    dimType,
    dimensionTypeOffset: { lengthOffset, widthOffset },
  } = options;

  if (
    from[0] === undefined ||
    from[1] === undefined ||
    to[0] === undefined ||
    to[1] === undefined
  ) {
    from[0] = 0;
    from[1] = 0;
    to[0] = 0;
    to[1] = 0;
  }

  const isOverall = dimType === "overall";
  const pointerRadius = isOverall ? 1.5 : 1.7;
  const indicatorLength = 1.7;

  const basePointer = new M.models.Polygon(3, pointerRadius);
  const startPointer = M.cloneObject(basePointer);
  const endPointer = M.cloneObject(basePointer);
  const dist = M.measure.pointDistance(from, to);

  if (orientation === "horizontal") {
    const textBoxSize = isOverall ? 11 : 14;

    const offset =
      dimensionType === "inner" ? widthOffset.inner / 2 : widthOffset.outer / 2;

    const startX = applyDimensionOffset(from[0], dimensionType, offset);
    const endX = applyDimensionOffset(to[0], dimensionType, -offset);

    // indicators
    model.models![`${type}StartIndicator`] = new M.models.ConnectTheDots(
      false,
      [
        [startX, from[1] + indicatorLength],
        [startX, from[1] - indicatorLength],
      ],
    );
    model.models![`${type}EndIndicator`] = new M.models.ConnectTheDots(false, [
      [endX, to[1] + indicatorLength],
      [endX, to[1] - indicatorLength],
    ]);

    // guide lines
    const beforeLine = new M.models.ConnectTheDots(false, [
      [startX, from[1]],
      [to[0] - dist / 2 - textBoxSize, to[1]],
    ]);
    model.models![`${type}LineBefore`] = beforeLine;

    model.models![`${type}LineAfter`] = new M.models.ConnectTheDots(false, [
      [to[0] - dist / 2 + textBoxSize, to[1]],
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
    const textBoxSize = isOverall ? 4 : 6;

    const offset =
      dimensionType === "inner"
        ? lengthOffset.inner / 2
        : lengthOffset.outer / 2;

    const startY = applyDimensionOffset(from[1], dimensionType, offset);
    const endY = applyDimensionOffset(to[1], dimensionType, -offset);

    model.models![`${type}StartIndicator`] = new M.models.ConnectTheDots(
      false,
      [
        [from[0] - indicatorLength, startY],
        [from[0] + indicatorLength, startY],
      ],
    );

    model.models![`${type}EndIndicator`] = new M.models.ConnectTheDots(false, [
      [to[0] - indicatorLength, endY],
      [to[0] + indicatorLength, endY],
    ]);

    model.models![`${type}LineBefore`] = new M.models.ConnectTheDots(false, [
      [from[0], startY],
      [from[0], to[1] - dist / 2 - textBoxSize],
    ]);

    model.models![`${type}LineAfter`] = new M.models.ConnectTheDots(false, [
      [to[0], to[1] - dist / 2 + textBoxSize],
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
      model.models![key]!.layer = isOverall ? "guideLineOverall" : "guideLine";
    }
  });
  P.shape.push(
    model,
    `${type}StartPointer`,
    { models: { startPointer, endPointer } },
    isOverall ? "pointerOverall" : "pointer",
  );

  // text
  const mid: IPoint = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const textCarrier = new M.models.ConnectTheDots(false, [[0, 0]]);
  const caption = M.model.addCaption(textCarrier, `${value.toFixed()} mm`, mid);

  P.shape.push(
    model,
    `${type}Text`,
    caption,
    isOverall ? `guideTextOverall` : `guideText`,
  );
}
