import { mapFiarDownload } from "@/utils/mapFiarDownload";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { CircleCheck, Zap } from "lucide-react";
import Link from "next/link";
import Price from "./Price";
import { PlanFeature, PlanPeriod } from "@repo/lib/data/plans";
import { Tarrif } from "@repo/db";

export const SubscriptionCard = ({
  props: { key, description, fairDownload, title, monthly },
  period,
  features,
  isRecommended,
}: {
  props: Tarrif;
  features: PlanFeature[];
  period: PlanPeriod;
  isRecommended: boolean;
}) => {
  return (
    <div
      className={cn(
        isRecommended && "bg-linear-to-r from-violet-500 to-purple-500",
        "p-1 rounded-2xl group",
      )}
    >
      {isRecommended && (
        <div className="flex justify-center items-center gap-1 text-sm pt-1.5 font-medium text-primary-foreground">
          <Zap size={16} fill="#8c38fe" />
          پیشنهاد پک ساز
        </div>
      )}

      <Card
        className={cn(
          isRecommended ? "mt-2 rounded-lg bg-background" : "mt-9 rounded-2xl",
          "p-5 space-y-8 w-xs",
        )}
      >
        <div className="flex flex-col gap-3">
          <span className="font-semibold">{title}</span>
          <Price period={period} price={monthly} />
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <Link href={`/payment?plan=${key}&period=${period}`}>
          <Button
            variant={isRecommended ? "gradient" : "primaryForeground"}
            className="w-full mb-8"
          >
            خرید اشتراک
          </Button>
        </Link>

        <div className="space-y-3 text-sm font-medium">
          <Separator />
          <div>دانلود منصفانه: {fairDownload} عدد</div>
          <Separator />
          {/* <ul className="text-xs text-muted-foreground space-y-1.5">
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
          </ul> */}
        </div>
      </Card>
    </div>
  );
};
