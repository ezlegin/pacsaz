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
  materialThickkness: number;
  safeFoldOffset: number;
}

export function addDoor({
  widthMM,
  heightMM,
  lengthMM,
  width,
  length,
  tuckFlap,
  materialThickkness: mThickness,
  safeFoldOffset,
}: AddDoorParams) {
  const topPanelWithFoldOffsetSize = heightMM;
  const door: IModel = {};

  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const tuckFlapSize = tuckFlap.size;
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

//  if (withFingerHole) {
//     const arc = new M.paths.Arc(
//       [width / 2, length + height],
//       toPt(fingerHoleRaduis),
//       30,
//       150
//     );

//     const { xLength, yLength } = getPathXYLength(arc);

//     const topOfHole = arc.origin[1]! + arc.radius;
//     const distanceFromFold =
//       topOfHole - (length + height) - yLength - toPt(safeFoldOffset);

//     M.model.moveRelative(arc, [0, -distanceFromFold]);

//     const fingerHoleModel: IModel = {
//       paths: { arc },
//     };

//     drawFoldLines(door, {
//       horizontals: [
//         {
//           from: [toPt(seamTotalWidth), foldY],
//           to: [width / 2 - xLength / 2, foldY],
//         },
//         {
//           from: [width / 2 + xLength / 2, foldY],
//           to: [width - toPt(seamTotalWidth), foldY],
//         },
//       ],
//     });

//     addModelToLayer(door, "fingerHole", fingerHoleModel, "trim");
//   } else {
//     addFoldLine(door, {
//       from: [toPt(seamTotalWidth), foldY],
//       to: [width - toPt(seamTotalWidth), foldY],
//       id: "fold-horizontal-x1",
//     });
//   }
