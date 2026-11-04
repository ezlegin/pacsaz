/** A number in Persian digits, at most `digits` decimals, without grouping. */
export const fa = (value: number, digits = 0) =>
  value.toLocaleString("fa-IR", { useGrouping: false, maximumFractionDigits: digits });
