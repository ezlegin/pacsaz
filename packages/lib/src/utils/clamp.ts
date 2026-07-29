export function clamp(value: number, min: number, max?: number): number {
  let result = value;
  if (result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}
