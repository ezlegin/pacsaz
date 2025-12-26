import { toPt } from "@/utils/sizeConvertor";
import { IModel } from "makerjs";
import { TuckFlap } from "../consts";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { addSeam } from "./addSeam";
import { cloneMirrorMove } from "./cloneMirrorMove";
import { addFoldLine } from "./foldLineGenerator";
import { getMeasurementOfModel } from "./getWidthAndHeightOfModel";
import { PointBuilder } from "./pointBuilder";

interface AddDoorParams {
  widthMM: number;
  heightMM: number;
  lengthMM: number;
  width: number;
  height: number;
  length: number;
  tuckFlap: TuckFlap;
  withFingerHole?: boolean;
  materialThickkness: number;
  safeFoldOffset: number;
}

export function addDoor({
  widthMM,
  heightMM,
  lengthMM,
  width,
  height,
  length,
  tuckFlap,
  withFingerHole,
  materialThickkness: mThickness,
  safeFoldOffset,
}: AddDoorParams) {
  const topPanelWithFoldOffsetSize = heightMM;

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

  const door = addLine(pts, false, 25);

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

  const seamModel: IModel = {
    models: {
      leftSeam,
      rightSeam,
    },
  };

  // addModelToLayer(door, "seam", seamModel, "trim");

  // ─────────────────────────────────────────
  // Fold Lines
  // ─────────────────────────────────────────
  const foldY = length + toPt(heightMM);
  const seamTotalWidth = tuckFlap.seam.w + mThickness;

  // addFoldLine(door, {
  //   id: "tuckflap-fold",
  //   from: [toPt(seamTotalWidth), foldY],
  //   to: [width - toPt(seamTotalWidth), foldY],
  // });

  // addFoldLine(door, {
  //   id: "topPanel-fold",
  //   from: [0 + 3, length + toPt(safeFoldOffset)], //todo
  //   to: [width - 3, length + toPt(safeFoldOffset)], //todo
  // });

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
