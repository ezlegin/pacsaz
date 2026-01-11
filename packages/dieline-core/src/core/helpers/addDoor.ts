import { toPt } from "../../utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { TuckFlap } from "../consts";
import { addLine } from "./addLine";
import { addSeam } from "./addSeam";
import { cloneMirrorMove } from "./cloneMirrorMove";
import { getMeasurementOfModel } from "./getWidthAndHeightOfModel";
import { PointBuilder } from "./pointBuilder";
import { addFoldLine } from "./addFoldLine";

interface AddDoorParams {
  widthMM: number;
  heightMM: number;
  lengthMM: number;
  width: number;
  length: number;
  tuckFlap: TuckFlap;
  materialThickness: number;
  safeFoldOffset: number;
}

export function addDoor({
  widthMM,
  heightMM,
  lengthMM,
  width,
  length,
  tuckFlap,
  materialThickness: mThickness,
  safeFoldOffset,
}: AddDoorParams) {
  const topPanelWithFoldOffsetSize = heightMM;
  const door: IModel = {};

  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const tuckFlapSize = tuckFlap.size(widthMM) - mThickness;
  const pb = new PointBuilder([0, lengthMM + safeFoldOffset]);

  const pts = pb
    .up(topPanelWithFoldOffsetSize)
    .right(mThickness)
    .up(tuckFlapSize)
    .right(widthMM - mThickness * 2)
    .down(tuckFlapSize)
    .right(mThickness)
    .down(topPanelWithFoldOffsetSize)
    .build();

  const doorLine = addLine(pts, false, 25, [3, 4]);

  // ─────────────────────────────────────────
  // Seam
  // ─────────────────────────────────────────
  const seamSize = {
    w: 8,
    h: 1.5,
  };

  const seamHeight = Math.max(mThickness * 2, seamSize.h);

  const seamPB = new PointBuilder([
    mThickness,
    lengthMM + topPanelWithFoldOffsetSize + safeFoldOffset,
  ]);
  const seamPTS = seamPB.right(seamSize.w).down(seamHeight).build();
  const leftSeam = addSeam(seamPTS, false, 2);

  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - toPt(seamSize.w + mThickness),
    length + toPt(topPanelWithFoldOffsetSize + safeFoldOffset - seamHeight),
  ]);

  const seam: IModel = {
    models: {
      leftSeam,
      rightSeam,
    },
  };

  M.model.addModel(door, { models: { doorLine, seam } }, "trim");

  // ─────────────────────────────────────────
  // Fold Lines
  // ─────────────────────────────────────────
  const foldY =
    length + toPt(heightMM) - toPt(mThickness) + toPt(safeFoldOffset);
  const seamTotalWidth = seamSize.w + mThickness;

  addFoldLine(door, {
    id: "tuckFlap-fold",
    from: [toPt(seamTotalWidth), foldY],
    to: [width - toPt(seamTotalWidth), foldY],
  });

  addFoldLine(door, {
    id: "topPanel-fold",
    from: [0, length + toPt(safeFoldOffset)],
    to: [width, length + toPt(safeFoldOffset)],
  });

  const { height: doorSize } = getMeasurementOfModel(door);

  return {
    model: door,
    pts,
    doorSize,
  };
}
