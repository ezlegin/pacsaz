function formatPrice<T extends string | number>(val: T) {
  if (typeof val === "number") return val.toLocaleString("en-US");
  return val;
}
