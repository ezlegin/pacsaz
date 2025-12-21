import * as makerjs from "makerjs";

export function getPathXYLength(path: makerjs.IPath) {
  const extents = makerjs.measure.pathExtents(path);

  if (!extents) {
    return { xLength: 0, yLength: 0 };
  }

  const xLength = extents.high[0]! - extents.low[0]!;
  const yLength = extents.high[1]! - extents.low[1]!;

  return {
    xLength,
    yLength,
  };
}
