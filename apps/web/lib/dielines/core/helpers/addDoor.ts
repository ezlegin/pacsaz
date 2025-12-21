import { toPt } from "@/utils/sizeConvertor";
import M, { IModel } from "makerjs";
import { addLine } from "./addLine";
import { addModelToLayer } from "./addModelToLayer";
import { addSeam } from "./addSeam";
import { cloneMirrorMove } from "./cloneMirrorMove";
import { drawFoldLines } from "./drawFoldLines";
import { addFoldLine } from "./foldLineGenerator";
import { getPathXYLength } from "./getPathXYLength";
import { PointBuilder } from "./pointBuilder";

interface AddDoorParams {
  widthMM: number;
  heightMM: number;
  lengthMM: number;
  width: number; // pt
  height: number; // pt
  length: number; // pt
  tuckFlap: {
    size: number;
    indent: number;
    seam: {
      w: number;
      h: number;
    };
  };
  withFingerHole?: boolean;
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
}: AddDoorParams) {
  // ─────────────────────────────────────────
  // Top door panel
  // ─────────────────────────────────────────
  const pb = new PointBuilder([0, lengthMM]);

  const pts = pb
    .up(heightMM + tuckFlap.seam.h / 2)
    .right(tuckFlap.indent)
    .up(tuckFlap.size)
    .right(widthMM - tuckFlap.indent * 2)
    .down(tuckFlap.size)
    .right(tuckFlap.indent)
    .down(heightMM + tuckFlap.seam.h / 2)
    .build();

  const door = addLine(pts, false, 25);

  // ─────────────────────────────────────────
  // Seam (left)
  // ─────────────────────────────────────────
  const seamPB = new PointBuilder([
    tuckFlap.indent,
    lengthMM + heightMM + tuckFlap.seam.h / 2,
  ]);

  const seamPTS = seamPB.right(tuckFlap.seam.w).down(tuckFlap.seam.h).build();

  const leftSeam = addSeam(seamPTS, false, 3);

  // ─────────────────────────────────────────
  // Seam (right – mirrored)
  // ─────────────────────────────────────────
  const rightSeam = cloneMirrorMove(leftSeam, true, false, [
    width - toPt(tuckFlap.seam.w + tuckFlap.indent),
    length + height - tuckFlap.seam.h - tuckFlap.seam.h / 2,
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
  const fingerHoleRaduis = 8;
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
  }

  if (!withFingerHole) {
    addFoldLine(door, {
      from: [toPt(tuckFlap.seam.w + tuckFlap.indent), length + height],
      to: [width - toPt(tuckFlap.seam.w + tuckFlap.indent), length + height],
      id: "fold-horizontal-1",
    });
  }

  return {
    model: door,
    pts,
  };
}
