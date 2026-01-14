export function formatPrice(price: number, suffix = true) {
  return `${price.toLocaleString("en-US")}${suffix ? " t" : ""}`;
}
