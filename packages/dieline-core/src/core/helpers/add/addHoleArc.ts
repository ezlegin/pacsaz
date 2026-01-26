import M, { IPoint } from "makerjs";
import { calculateDustHoleSize } from "../calculate/calculateDustHoleSize";

interface CreateDustHoleParams {
  startPoint: IPoint;
  safeFoldOffset: number;
}

export function addHoleArc({
  startPoint,
  safeFoldOffset,
}: CreateDustHoleParams) {
  const { holeRadius, addLineToHole, endAngle } =
    calculateDustHoleSize(safeFoldOffset);

  const arcStartPoint: [number, number] = [
    startPoint[0]! + holeRadius,
    startPoint[1]!,
  ];

  const arc = new M.paths.Arc(arcStartPoint, holeRadius, 180, endAngle);

  return {
    hole: arc,
    holeRadius,
    addLineToHole,
    endAngle,
  };
}
