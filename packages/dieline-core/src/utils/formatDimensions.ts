export function formatDimensions({
  width,
  length,
  height,
}: {
  width: number;
  length: number;
  height: number;
}) {
  const values = [+width.toFixed(1), +length.toFixed(1)];

  if (height > 0) {
    values.push(+height.toFixed(1));
  }

  return `${values.join(" x ")} mm`;
}
