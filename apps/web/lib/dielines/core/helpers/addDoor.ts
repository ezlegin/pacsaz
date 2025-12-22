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
  const selectedMaterial = MATERIALS[material];

  const foldOffset = selectedMaterial.thickness / 2;
  const topPanelWithFoldOffsetSize =
    heightMM + foldOffset + selectedMaterial.thickness;
  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const pb = new PointBuilder([0, lengthMM]);

  const pts = pb
    .up(topPanelWithFoldOffsetSize)
    .right(tuckFlap.indent)
    .up(tuckFlap.size - selectedMaterial.thickness)
    .right(widthMM - tuckFlap.indent * 2)
    .down(tuckFlap.size - selectedMaterial.thickness)
    .right(tuckFlap.indent)
    .down(topPanelWithFoldOffsetSize)
    .build();

  const door = addLine(pts, false, 25);

  // ─────────────────────────────────────────
  // Seam
  // ─────────────────────────────────────────
  const seamPB = new PointBuilder([
    tuckFlap.indent,
    lengthMM + topPanelWithFoldOffsetSize,
  ]);

  const seamPTS = seamPB
    .right(tuckFlap.seam.w)
    .down(selectedMaterial.thickness * 2)
    .build();

  const leftSeam = addSeam(seamPTS, false, 3);

  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - toPt(tuckFlap.seam.w + tuckFlap.indent),
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
  if (withFingerHole) {
    const arc = new M.paths.Arc(
      [width / 2, length + height],
      toPt(fingerHoleRaduis),
      30,
      150
    );

    const { xLength, yLength } = getPathXYLength(arc);
    const topOfHole = arc.origin[1]! + arc.radius;
    const distanceFromFold = topOfHole - (length + height) - yLength;
    M.model.moveRelative(arc, [0, -distanceFromFold]);

    const fingerHoleModel: IModel = {
      paths: { arc },
    };

    drawFoldLines(door, {
      horizontals: [
        {
          from: [toPt(tuckFlap.seam.w + tuckFlap.indent), length + height],
          to: [width / 2 - xLength / 2, length + height],
        },
        {
          from: [width / 2 + xLength / 2, length + height],
          to: [
            width - toPt(tuckFlap.seam.w + tuckFlap.indent),
            length + height,
          ],
        },
      ],
    });

    addModelToLayer(door, "fingerHole", fingerHoleModel, "trim");
  } else {
    addFoldLine(door, {
      from: [
        toPt(tuckFlap.seam.w + tuckFlap.indent),
        length + toPt(heightMM + foldOffset),
      ],
      to: [
        width - toPt(tuckFlap.seam.w + tuckFlap.indent),
        length + toPt(heightMM + foldOffset),
      ],
      id: "fold-horizontal-x1",
    });
  }

  // ─────────────────────────────────────────
  // Fold Lines
  // ─────────────────────────────────────────
  // topPanel Fold Line
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
