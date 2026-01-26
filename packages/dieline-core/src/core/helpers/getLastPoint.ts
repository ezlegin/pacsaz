import M, { IModel, IPath, IPoint } from "makerjs";

export function getLastPoint(points: IPoint[]): IPoint {
  const pt = points[points.length - 1];

  return [pt![0]!, pt![1]!];
}

export function getLastPointPt(points: IPoint[]): IPoint {
  const pt = points[points.length - 1];

  return [pt![0]!, pt![1]!];
}

export function getLastPointFromModel(model: IModel) {
  const chain = M.model.findSingleChain(model);
  M.chain.reverse(chain);
  const pts = M.chain.toKeyPoints(chain);
  return getLastPointPt(pts);
}

export function getLastPointFromPath(path: IPath) {
  const pts = M.path.toKeyPoints(path);
  return getLastPoint(pts);
}
