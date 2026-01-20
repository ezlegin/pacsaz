import { cn } from "@repo/ui/lib/utils";
import { SubPeriod } from "./SubscriptionList";
import { periodMultiplier } from "@/hooks/usePaymentCheckout";
import { mapPeriodLabel } from "@/data/user";

const Price = ({
  price,
  size = "lg",
  period,
}: {
  price: number;
  size?: "sm" | "lg";
  period: SubPeriod;
}) => {
  const finalPrice = periodMultiplier(period, price, period === "annual");

  return (
    <div className="space-x-1">
      <span className={size === "sm" ? "font-semibold" : "text-3xl font-bold"}>
        {(finalPrice / 1000).toLocaleString("en-US")} تومان
      </span>
      <span
        className={cn(
          size === "sm" ? "text-xs" : "text-sm",
          "text-muted-foreground"
        )}
      >
        / {mapPeriodLabel(period)}
      </span>
    </div>
  );
};

export default Price;
