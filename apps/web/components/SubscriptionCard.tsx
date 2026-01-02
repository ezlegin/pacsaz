import { PlanFeature, SubCardProps } from "@/data/subscription";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { CircleCheck, Zap } from "lucide-react";
import Link from "next/link";
import Price from "./Price";
import { SubPeriod } from "./SubscriptionList";

export const SubscriptionCard = ({
  props: {
    key,
    description,
    fairDownload: { annual, monthly },
    price,
    title,
  },
  index,
  isAnnual,
  features,
}: {
  props: SubCardProps;
  index: number;
  features: PlanFeature[];
  isAnnual: boolean;
}) => {
  const fairDownload = isAnnual ? annual : monthly;
  const period: SubPeriod = isAnnual ? "annual" : "monthly";

  return (
    <div className="even:bg-gradient-to-r even:from-violet-500 even:to-purple-500 p-1 rounded-2xl group">
      {index === 1 && (
        <div className="flex justify-center items-center gap-1 text-sm pt-1.5 font-medium text-primary-foreground">
          <Zap size={16} fill="#8c38fe" />
          پیشنهاد پک ساز
        </div>
      )}

      <div
        className={cn(
          index === 1 ? "mt-2 rounded-lg" : "mt-9 rounded-2xl",
          "bg-white p-5  space-y-8 w-xs"
        )}
      >
        <div className="flex flex-col gap-3">
          <span className="font-semibold">{title}</span>
          <Price isAnnual={isAnnual} price={price} />
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <Link href={`/payment?plan=${key}&period=${period}`}>
          <Button
            variant={index === 1 ? "gradient" : "primaryForeground"}
            className="w-full mb-8"
          >
            خرید اشتراک
          </Button>
        </Link>

        <div className="space-y-3 text-sm font-medium">
          <Separator />
          <div>دانلود منصفانه: {fairDownload} عدد</div>
          <Separator />
          <ul className="text-xs text-muted-foreground space-y-1.5">
            {features.map((i, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CircleCheck
                  size={13}
                  className={
                    !i.active ? "text-muted-foreground" : "text-green-600"
                  }
                />
                {i.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
