import { getDielineSettings } from "@repo/store/dieline/dielineSettings.store";
import M, { IModel } from "makerjs";
import { calcualteTuckFlapSize } from "../../../utils/calculate/calculateTuckFlapSize";
import { cloneMirrorMove } from "../clone";
import { getMeasurementOfModel } from "../getWidthAndHeightOfModel";
import { PointBuilder } from "../pointBuilder";
import { addFoldLine } from "./addFoldLine";
import { addLine } from "./addLine";
import { addSeam } from "./addSeam";

export function addDoor() {
  const door: IModel = {};
  const {
    thickness,
    safeFoldOffset,
    dimension: {
      resolved: { height, length, width },
    },
  } = getDielineSettings();

  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const tuckFlapSize = calcualteTuckFlapSize(width);
  const pb = new PointBuilder([0, length + safeFoldOffset]);

  const pts = pb
    .up(height)
    .right(thickness)
    .up(tuckFlapSize)
    .right(width - thickness * 2)
    .down(tuckFlapSize)
    .right(thickness)
    .down(height)
    .build();

  const doorLine = addLine(pts, false, 25, [3, 4]);

  // ─────────────────────────────────────────
  // Seam
  // ─────────────────────────────────────────
  const seamSize = {
    w: 8,
    h: 1.5,
  };

  const seamHeight = Math.max(thickness * 2, seamSize.h);

  const seamPB = new PointBuilder([
    thickness,
    length + height + safeFoldOffset,
  ]);
  const seamPTS = seamPB.right(seamSize.w).down(seamHeight).build();
  const leftSeam = addSeam(seamPTS, false, 2);

  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - (seamSize.w + thickness),
    length + (height + safeFoldOffset - seamHeight),
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
  const foldY = length + height - thickness + safeFoldOffset;
  const seamTotalWidth = seamSize.w + thickness;

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
