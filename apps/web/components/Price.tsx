import { PlanPrice } from "@/data/subscription";
import { cn } from "@repo/ui/lib/utils";

const Price = ({
  isAnnual,
  price,
  size = "lg",
}: {
  isAnnual: boolean;
  price: PlanPrice;
  size?: "sm" | "lg";
}) => {
  const chosenPrice = isAnnual ? price.monthlyOnAnnual : price.monthly;

  return (
    <div className="space-x-1">
      <span className={size === "sm" ? "font-semibold" : "text-3xl font-bold"}>
        {(chosenPrice / 1000).toLocaleString("en-US")} تومان
      </span>
      <span
        className={cn(
          size === "sm" ? "text-xs" : "text-sm",
          "text-muted-foreground"
        )}
      >
        / ماهانه
      </span>
    </div>
  );
};

export default Price;
