import { toMm } from "@/utils/sizeConvertor";
import M from "makerjs";

export function getLastPointMm(points: M.IPoint[]): [number, number] {
  const pt = points[points.length - 1];

  return [toMm(pt![0]!), toMm(pt![1]!)];
}
