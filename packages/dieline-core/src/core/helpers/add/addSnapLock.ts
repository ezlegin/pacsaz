import M, { IModel, IPoint } from "makerjs";
import { zero } from "../../../data/consts";
import { cloneMirrorMove } from "../clone";
import { getDistanceOfFirstAndLastPoint } from "../getDistance";
import { getLastPointFromModel } from "../getLastPoint";
import { PointBuilder } from "../pointBuilder";
import { addFoldLine } from "./addFoldLine";
import { addLine } from "./addLine";
import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";

export function addSnapLock({
  height,
  width,
  safeFoldOffset,
}: {
  width: number;
  height: number;
  safeFoldOffset: number;
}) {
  const snapLock: IModel = { models: {} };
  const { thickness } = getDielineSettings();

  function mapTabWidth() {
    let tabWidth: number = width / 3;

    if (width >= 70) tabWidth = width / 4;
    if (width >= 140) tabWidth = width / 5;
    if (width >= 230) tabWidth = width / 6;

    const maxTabWidth = lockHeightRaw - tabHeight;

    return Math.min(maxTabWidth, tabWidth);
  }

  const fitInOffset = {
    x: thickness < 1.5 ? 0.5 : 1,
    y: thickness,
  };
  const arcRadiusPT = safeFoldOffset;
  const arcRadiusMM = safeFoldOffset;
  const baseOffset = arcRadiusPT / 2;
  const lockHeightRaw = height * 0.75;
  const lockHeight = lockHeightRaw - baseOffset;
  const tabHeight = lockHeightRaw / 3;
  const tabWidthRaw = mapTabWidth();
  const tabWidth = tabWidthRaw - arcRadiusMM;
  const toungeWidth = width - tabWidth * 2 - arcRadiusMM * 2;
  const lockHorizon = lockHeightRaw - tabHeight;
  const lockerIndent = 5;
  const partsRoundness = 10;
  const { disOfWidth: foldOffset } = addHole({
    origin: zero,
    arcRadius: arcRadiusPT,
    direction: "right",
    type: "three-quarter",
  });

  //! PART 1 --------------------------------
  function part1() {
    const { arc: startArc, arcPoints: startArcPoints } = addHole({
      origin: [0, -baseOffset],
      arcRadius: arcRadiusPT,
      direction: "right",
      type: "quarter",
    });

    const pb = new PointBuilder(startArcPoints[0]!);
    const pts = pb
      .down(lockHeight)
      .right(tabWidth - fitInOffset.x)
      .up(tabHeight + fitInOffset.y)
      .right(toungeWidth + fitInOffset.x * 2)
      .down(tabHeight + fitInOffset.y)
      .right(tabWidth - fitInOffset.x)
      .up(lockHeight)
      .build();

    const line = addLine(pts, false, partsRoundness, [2, 5]);

    const { arc: endArc, arcPoints: endArcPoints } = addHole({
      origin: geOriginArcFromLine(line, arcRadiusPT),
      arcRadius: arcRadiusPT,
      direction: "left",
      type: "quarter",
    });

    // FOLD
    addFoldLine(snapLock, {
      id: "part1-fold",
      from: [foldOffset, 0],
      to: [width - foldOffset, 0],
    });

    const part1Model: IModel = {
      models: { line },
      paths: { startArc, endArc },
    };
    return { part1Model, lastPointOfPart1: endArcPoints[0]! };
  }

  const { part1Model, lastPointOfPart1 } = part1();

  //! PART 2 --------------------------------
  const lockerRoundness = 8;

  function part2({ considerStarterHole }: { considerStarterHole: boolean }) {
    const {
      arc: startArc,
      arcPoints: startArcPoints,
      disOfWidth,
    } = addHole({
      origin: [lastPointOfPart1[0]!, lastPointOfPart1[1]! - arcRadiusPT],
      arcRadius: arcRadiusPT,
      direction: "right",
      type: "three-quarter",
    });

    const pb = new PointBuilder(
      considerStarterHole ? startArcPoints[0]! : [width, 0]
    );
    const pts = pb
      .draw(lockHorizon - (considerStarterHole ? disOfWidth : 0), -tabWidthRaw)
      .draw(-lockerIndent, -tabHeight)
      .right(lockerIndent + height - lockHorizon - arcRadiusMM)
      .up(tabWidthRaw + tabHeight - baseOffset)
      .build();

    const line = addLine(pts, false, lockerRoundness, [2]);

    const { arc: endArc, arcPoints: endArcPoints } = addHole({
      origin: geOriginArcFromLine(line, arcRadiusPT),
      arcRadius: arcRadiusPT,
      direction: "left",
      type: "quarter",
    });

    const part2Model: IModel = {
      models: { line },
      paths: considerStarterHole ? { startArc, endArc } : { endArc },
    };

    // FOLD
    addFoldLine(snapLock, {
      id: "part2-fold",
      from: [width + foldOffset, 0],
      to: [width + height - foldOffset, 0],
    });

    return { part2Model, lastPointOfPart2: endArcPoints[0]! };
  }

  const { part2Model, lastPointOfPart2 } = part2({
    considerStarterHole: true,
  });

  //! PART 3 --------------------------------
  function part3() {
    const {
      arc: startArc,
      arcPoints: startArcPoints,
      disOfWidth,
      disOfHeight,
    } = addHole({
      origin: [lastPointOfPart2[0]!, lastPointOfPart2[1]! - arcRadiusPT],
      arcRadius: arcRadiusPT,
      direction: "right",
      type: "three-quarter",
    });

    const difOfArcs = arcRadiusPT - disOfWidth;

    const pb = new PointBuilder(startArcPoints[0]!);
    const pts = pb
      .draw(tabWidth + difOfArcs, -lockHorizon)
      .down(tabHeight)
      .right(toungeWidth)
      .up(tabHeight)
      .draw(tabWidth + difOfArcs, lockHorizon)
      .build();

    const line = addLine(pts, false, partsRoundness, [2, 3]);

    const lastPointOfLine = getLastPointFromModel(line);
    const { arc: endArc, arcPoints: endArcPoints } = addHole({
      origin: [
        lastPointOfLine[0]! + arcRadiusPT - difOfArcs,
        lastPointOfLine[1]! - arcRadiusPT + disOfHeight,
      ],
      arcRadius: arcRadiusPT,
      direction: "left",
      type: "three-quarter",
    });

    const part3Model: IModel = {
      models: { line },
      paths: { startArc, endArc },
    };

    // FOLD
    addFoldLine(snapLock, {
      id: "part3-fold",
      from: [width + height + foldOffset, 0],
      to: [width * 2 + height - foldOffset, 0],
    });

    return { part3Model, lastPointOfPart3: endArcPoints[0]! };
  }

  const { part3Model } = part3();

  //! PART 4 --------------------------------

  function part4() {
    const { part2Model: part2Model_dup } = part2({
      considerStarterHole: false,
    });

    const part4Model = cloneMirrorMove(part2Model_dup, true, false, [
      width * 2 + height,
      -(tabWidthRaw + tabHeight),
    ]);

    // FOLD
    addFoldLine(snapLock, {
      id: "part4-fold",
      from: [width * 2 + height + foldOffset, 0],
      to: [width * 2 + height * 2, 0],
    });

    return { part4Model };
  }

  const { part4Model } = part4();

  M.model.addModel(
    snapLock,
    { models: { part1Model, part2Model, part3Model, part4Model } },
    "trim"
  );
  return { snapLock };
}

function addHole({
  origin,
  arcRadius,
  type,
  direction,
}: {
  origin: IPoint;
  arcRadius: number;
  direction: "left" | "right";
  type: "semi" | "quarter" | "three-quarter";
}) {
  const startAngle =
    type === "semi"
      ? 0
      : type === "quarter"
        ? direction === "right"
          ? 0
          : 90
        : direction === "right"
          ? 30
          : 90;

  const endAngle =
    type === "semi"
      ? 180
      : type === "quarter"
        ? direction === "right"
          ? 90
          : 180
        : direction === "right"
          ? 90
          : 150;

  const arc = new M.paths.Arc(origin, arcRadius, startAngle, endAngle);

  const arcPoints = M.point.fromArc(arc);
  const { disOfWidth, disOfHeight } = getDistanceOfFirstAndLastPoint(
    arc,
    "path"
  );

  return { arc, arcPoints, disOfWidth, disOfHeight };
}

function geOriginArcFromLine(lineModel: IModel, arcRadiusPT: number) {
  const lastPointOfLine = getLastPointFromModel(lineModel);
  const origin = [lastPointOfLine[0]! + arcRadiusPT, lastPointOfLine[1]!];

  return origin;
}
