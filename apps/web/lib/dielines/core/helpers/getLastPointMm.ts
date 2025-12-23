import { toMm } from "@/utils/sizeConvertor";
import { IPoint } from "makerjs";

export function getLastPointMm(points: IPoint[]): IPoint {
  const pt = points[points.length - 1];

  return [toMm(pt![0]!), toMm(pt![1]!)];
}
