import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { zero } from "../consts";
import { addFoldLine } from "./addFoldLine";
import { addLine } from "./addLine";
import { cloneMirrorMove } from "./cloneMirrorMove";
import { getLastPointFromModel } from "./getLastPoint";
import { PointBuilder } from "./pointBuilder";

export function addSnapLock({
  heightMM,
  widthMM,
  materialThickness,
}: {
  widthMM: number;
  heightMM: number;
  lengthMM: number;
  materialThickness: number;
}) {
  const snapLock: IModel = { models: {} };

  // PART 1 --------------------------------
  const fitInOffset = {
    x: materialThickness < 1.5 ? 0.5 : 1,
    y: materialThickness,
  };
  const lockHorizon = heightMM / 2;
  const lockHeight = heightMM * 0.75; // 3/4
  const tabWidth = heightMM / 2;
  const tabHeight = lockHeight / 3;
  const toungeWidth = widthMM - tabWidth * 2;

  const part1_pb = new PointBuilder(zero);
  const part1_pts = part1_pb
    .down(lockHeight)
    .right(tabWidth - fitInOffset.x)
    .up(tabHeight + fitInOffset.y)
    .right(toungeWidth + fitInOffset.x * 2)
    .down(tabHeight + fitInOffset.y)
    .right(tabWidth - fitInOffset.x)
    .up(lockHeight)
    .build();
  const part1 = addLine(part1_pts, false, 10, [2, 5]);

  // PART 2 --------------------------------
  const lockerIndent = 5;

  const part2_pb = new PointBuilder(getLastPointFromModel(part1, "mm"));
  const part2_pts = part2_pb
    .draw(tabWidth, -lockHorizon)
    .draw(-lockerIndent, -tabHeight)
    .right(heightMM - tabWidth + lockerIndent)
    .up(lockHeight)
    .build();

  const part2 = addLine(part2_pts, false, 10, [2]);

  // PART 3 --------------------------------

  const part3_pb = new PointBuilder(getLastPointFromModel(part2, "mm"));
  const part3_pts = part3_pb
    .draw(tabWidth, -lockHorizon)
    .down(tabHeight)
    .right(toungeWidth)
    .up(tabHeight)
    .draw(tabWidth, lockHorizon)
    .build();

  const part3 = addLine(part3_pts, false, 10, [2, 3]);

  // PART 4 --------------------------------
  const part4 = cloneMirrorMove(part2, true, false, [
    toPt(widthMM * 2 + heightMM),
    toPt(-lockHeight),
  ]);

  addFoldLine(snapLock, {
    id: "snapLock-fold",
    from: zero,
    to: [toPt(widthMM * 2 + heightMM * 2), 0],
  });

  // Layaring ---------------------------------
  M.model.addModel(
    snapLock,
    { models: { part1, part2, part3, part4 } },
    "trim"
  );

  return { snapLock };
}
