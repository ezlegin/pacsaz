export function mapDimensions(width: number, length: number, height?: number) {
  let dim = `${width}x${length}`;
  if (height) dim += "x" + height;

  dim += "mm";
  return dim;
}
