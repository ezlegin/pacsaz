import { PlanPeriod, Price } from "@repo/db";

export const PriceMapper = (
  period: PlanPeriod,
  price: Price,
  discountAmount: number,
) => {
  const discountFactor = 1 - discountAmount / 100;

  switch (period) {
    case "monthly":
      return price.monthly * discountFactor;
    case "threeMonth":
      return price.threeMonth * discountFactor;
    case "annual":
      return price.annual * discountFactor;
  }
};
