import M, { IModel, IPath, IPoint } from "makerjs";

export function getDistanceOfFirstAndLastPoint(
  entry: IPath | IModel,
  type: "path" | "model"
) {
  let keyPoints: IPoint[] = [];

  if (type === "path") {
    keyPoints = M.path.toKeyPoints(entry as IPath);
  } else {
    const chain = M.model.findSingleChain(entry as IModel);
    if (chain) {
      keyPoints = M.chain.toKeyPoints(chain);
    }
  }

  if (keyPoints.length < 2) {
    throw new Error("Not enough points to calculate distance.");
  }

  const firstPoint = keyPoints[0]!;
  const lastPoint = keyPoints[keyPoints.length - 1]!;

  const disOfHeight = M.measure.pointDistance(
    [0, firstPoint[1]!],
    [0, lastPoint[1]!]
  );

  const disOfWidth = M.measure.pointDistance(
    [firstPoint[0]!, 0],
    [lastPoint[0]!, 0]
  );

  return {
    disOfHeight,
    disOfWidth,
  };
}
