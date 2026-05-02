import { mapPeriodLabel } from "@/utils/mapPeriodLabel";
import { PlanPeriod } from "@repo/lib/data/plans";
import { cn } from "@repo/ui/lib/utils";

const Price = ({
  price,
  size = "lg",
  period,
}: {
  price: number;
  size?: "sm" | "lg";
  period: PlanPeriod;
}) => {
  return (
    <div className="space-x-1">
      <span className={size === "sm" ? "font-semibold" : "text-3xl font-bold"}>
        {(price / 1000).toLocaleString("en-US")} تومان
      </span>
      <span
        className={cn(
          size === "sm" ? "text-xs" : "text-sm",
          "text-muted-foreground",
        )}
      >
        / {mapPeriodLabel(period)}
      </span>
    </div>
  );
};

export default Price;
