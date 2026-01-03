export function formatPrice(price: number, suffix = false) {
  return `${price.toLocaleString("en-US")}${suffix ? " تومان" : ""}`;
}
