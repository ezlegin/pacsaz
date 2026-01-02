import { cn } from "@workspace/ui/lib/utils";

const Price = ({
  discountFactor,
  isAnnual,
  price,
  size = "lg",
}: {
  isAnnual: boolean;
  price: number;
  discountFactor: number;
  size?: "sm" | "lg";
}) => {
  return (
    <div className="space-x-1">
      <span className={size === "sm" ? "font-semibold" : "text-3xl font-bold"}>
        {(isAnnual
          ? (price * (1 - discountFactor)).toFixed()
          : price
        ).toLocaleString("en-US")}{" "}
        تومان
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
