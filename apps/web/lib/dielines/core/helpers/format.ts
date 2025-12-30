export function formatToFixed(value: string) {
  if (value === "0" || value === "0.") return value;
  if (+value < 1) return (+value).toFixed(1);
  return Number.isInteger(+value) ? value.toString() : (+value).toFixed(1);
}
