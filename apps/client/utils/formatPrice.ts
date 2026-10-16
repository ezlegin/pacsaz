/**
 * Prices are stored in Rial-ish units; the UI shows thousands of Toman as
 * Persian digits with grouping, e.g. `۲۹۹٬۰۰۰`.
 */
export const formatToman = (value: number) =>
  Math.round(value / 1000).toLocaleString("fa-IR", { useGrouping: true });

/** Same, for a count that should not be grouped. */
export const formatFa = (value: number) =>
  Math.round(value).toLocaleString("fa-IR", { useGrouping: false });
