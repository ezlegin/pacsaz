import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { MaterialKey, MATERIALS, TuckFlap } from "../consts";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { addSeam } from "./addSeam";
import { cloneMirrorMove } from "./cloneMirrorMove";
import { drawFoldLines } from "./drawFoldLines";
import { addFoldLine } from "./foldLineGenerator";
import { getPathXYLength } from "./getPathXYLength";
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
  material: MaterialKey;
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
  material,
}: AddDoorParams) {
  const { thickness: mThickness } = MATERIALS[material];

  const foldOffset = mThickness / 2;
  const topPanelWithFoldOffsetSize = heightMM + foldOffset + mThickness;

  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const tuckFlapSize = tuckFlap.size - mThickness;
  const pb = new PointBuilder([0, lengthMM]);

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
  const seamPB = new PointBuilder([
    mThickness,
    lengthMM + topPanelWithFoldOffsetSize,
  ]);

  const seamPTS = seamPB
    .right(tuckFlap.seam.w)
    .down(mThickness * 2)
    .build();

  const leftSeam = addSeam(seamPTS, false, 3);

  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - toPt(tuckFlap.seam.w + mThickness),
    length + height - toPt(foldOffset),
  ]);

  const seamModel: IModel = {
    models: {
      leftSeam,
      rightSeam,
    },
  };

  addModelToLayer(door, "seam", seamModel, "trim");

  // ─────────────────────────────────────────
  // Finger Hole
  // ─────────────────────────────────────────
  const fingerHoleRaduis = 10;
  const foldY = length + toPt(heightMM + foldOffset);
  const seamTotalWidth = tuckFlap.seam.w + mThickness;

  if (withFingerHole) {
    const arc = new M.paths.Arc(
      [width / 2, length + height],
      toPt(fingerHoleRaduis),
      30,
      150
    );

    const { xLength, yLength } = getPathXYLength(arc);

    const topOfHole = arc.origin[1]! + arc.radius;
    const distanceFromFold =
      topOfHole - (length + height) - yLength - toPt(mThickness / 2);

    M.model.moveRelative(arc, [0, -distanceFromFold]);

    const fingerHoleModel: IModel = {
      paths: { arc },
    };

    drawFoldLines(door, {
      horizontals: [
        {
          from: [toPt(seamTotalWidth), foldY],
          to: [width / 2 - xLength / 2, foldY],
        },
        {
          from: [width / 2 + xLength / 2, foldY],
          to: [width - toPt(seamTotalWidth), foldY],
        },
      ],
    });

    addModelToLayer(door, "fingerHole", fingerHoleModel, "trim");
  } else {
    addFoldLine(door, {
      from: [toPt(seamTotalWidth), foldY],
      to: [width - toPt(seamTotalWidth), foldY],
      id: "fold-horizontal-x1",
    });
  }

  // ─────────────────────────────────────────
  // Fold Lines
  // ─────────────────────────────────────────
  addFoldLine(door, {
    id: "opener-fold-horizontal",
    from: [0, length + toPt(foldOffset)],
    to: [width, length + toPt(foldOffset)],
  });

  const { height: doorSize } = getMeasurementOfModel(door);

  return {
    model: door,
    pts,
    doorSize,
  };
}
