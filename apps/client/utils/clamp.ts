export function clamp(value: number, min: number) {
  if (value < min) return min;
  return value;
}
