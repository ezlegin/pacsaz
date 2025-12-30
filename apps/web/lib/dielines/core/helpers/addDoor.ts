import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { TuckFlap } from "../consts";
import { addLine } from "./addLine";
import { addSeam } from "./addSeam";
import { cloneMirrorMove } from "./cloneMirrorMove";
import { getMeasurementOfModel } from "./getWidthAndHeightOfModel";
import { PointBuilder } from "./pointBuilder";

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

  const doorLine = addLine(pts, false, 25);

  // ─────────────────────────────────────────
  // Seam
  // ─────────────────────────────────────────
  const seamHeight = Math.max(mThickness * 2, tuckFlap.seam.h);

  const seamPB = new PointBuilder([
    mThickness,
    lengthMM + topPanelWithFoldOffsetSize + safeFoldOffset,
  ]);
  const seamPTS = seamPB.right(tuckFlap.seam.w).down(seamHeight).build();
  const leftSeam = addSeam(seamPTS, false, 2);

  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - toPt(tuckFlap.seam.w + mThickness),
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
  const foldY = length + toPt(heightMM);
  const seamTotalWidth = tuckFlap.seam.w + mThickness;

  const tuckFlapFold = new M.paths.Line([
    [toPt(seamTotalWidth), foldY],
    [width - toPt(seamTotalWidth), foldY],
  ]);
  M.path.addTo(tuckFlapFold, door, "tuckFlap-fold");

  const topPanelFold = new M.paths.Line([
    [0, length + toPt(safeFoldOffset)],
    [width, length + toPt(safeFoldOffset)],
  ]);
  M.path.addTo(topPanelFold, door, "topPanel-fold");

  const { height: doorSize } = getMeasurementOfModel(door);

  return {
    model: door,
    pts,
    doorSize,
  };
}
