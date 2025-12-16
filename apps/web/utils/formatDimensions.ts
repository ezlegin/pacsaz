export function formatDimensions({
  width,
  length,
  height,
}: {
  width: number;
  length: number;
  height: number;
}) {
  const values = [width, length];

  if (height > 0) {
    values.push(height);
  }

  return `${values.join(" x ")} mm`;
}
