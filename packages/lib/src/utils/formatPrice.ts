export function formatPrice(
  price: number,
  suffix = false,
  lang: "fa" | "en" = "fa"
) {
  if (lang === "fa")
    return `${price.toLocaleString("en-US")}${suffix ? " تومان" : ""}`;
  else return `${price.toLocaleString("en-US")}${suffix ? " t" : ""}`;
}
