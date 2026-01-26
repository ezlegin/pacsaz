import M, { IModel } from "makerjs";
import { TuckFlap } from "../../../data/consts";
import { cloneMirrorMove } from "../clone";
import { getMeasurementOfModel } from "../getWidthAndHeightOfModel";
import { PointBuilder } from "../pointBuilder";
import { addFoldLine } from "./addFoldLine";
import { addLine } from "./addLine";
import { addSeam } from "./addSeam";

interface AddDoorParams {
  width: number;
  height: number;
  length: number;
  tuckFlap: TuckFlap;
  materialThickness: number;
  safeFoldOffset: number;
}

export function addDoor({
  width,
  height,
  length,
  tuckFlap,
  materialThickness: mThickness,
  safeFoldOffset,
}: AddDoorParams) {
  const topPanelWithFoldOffsetSize = height;
  const door: IModel = {};

  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const tuckFlapSize = tuckFlap.size(width) - mThickness;
  const pb = new PointBuilder([0, length + safeFoldOffset]);

  const pts = pb
    .up(topPanelWithFoldOffsetSize)
    .right(mThickness)
    .up(tuckFlapSize)
    .right(width - mThickness * 2)
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
    length + topPanelWithFoldOffsetSize + safeFoldOffset,
  ]);
  const seamPTS = seamPB.right(seamSize.w).down(seamHeight).build();
  const leftSeam = addSeam(seamPTS, false, 2);

  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - (seamSize.w + mThickness),
    length + (topPanelWithFoldOffsetSize + safeFoldOffset - seamHeight),
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
  const foldY = length + height - mThickness + safeFoldOffset;
  const seamTotalWidth = seamSize.w + mThickness;

  addFoldLine(door, {
    id: "tuckFlap-fold",
    from: [seamTotalWidth, foldY],
    to: [width - seamTotalWidth, foldY],
  });

  addFoldLine(door, {
    id: "topPanel-fold",
    from: [0, length + safeFoldOffset],
    to: [width, length + safeFoldOffset],
  });

  const { height: doorSize } = getMeasurementOfModel(door);

  return {
    model: door,
    pts,
    doorSize,
  };
}
