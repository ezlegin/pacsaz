import M, { IModel, IPath, IPoint } from "makerjs";
import { toMm } from "@/@/utils/sizeConvertor";

export function getLastPointMm(points: IPoint[]): IPoint {
  const pt = points[points.length - 1];

  return [toMm(pt![0]!), toMm(pt![1]!)];
}

export function getLastPointPt(points: IPoint[]): IPoint {
  const pt = points[points.length - 1];

  return [pt![0]!, pt![1]!];
}

export function getLastPointFromModel(model: IModel, unit: "mm" | "pt") {
  const chain = M.model.findSingleChain(model);
  M.chain.reverse(chain);
  const pts = M.chain.toKeyPoints(chain);
  return unit === "pt" ? getLastPointPt(pts) : getLastPointMm(pts);
}

export function getLastPointFromPath(path: IPath, unit: "mm" | "pt") {
  const pts = M.path.toKeyPoints(path);
  return unit === "pt" ? getLastPointPt(pts) : getLastPointMm(pts);
}
