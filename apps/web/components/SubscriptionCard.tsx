import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { CircleCheck, Zap } from "lucide-react";
import Price from "./Price";
import { PlanKey, PlanTitle } from "@/data/user";

export interface SubCardProps {
  title: PlanTitle;
  price: number;
  description: string;
  key: PlanKey;
  shortDescription: string;
  level: 1 | 2 | 3;
  fairDownload: number | undefined;
}

export const SubscriptionCard = ({
  props: { description, fairDownload: failDownload, price, title },
  index,
  isAnnual,
  discountFactor,
}: {
  props: SubCardProps;
  index: number;
  isAnnual: boolean;
  discountFactor: number;
}) => {
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
          <Price
            discountFactor={discountFactor}
            isAnnual={isAnnual}
            price={price}
          />
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <Button
          variant={index === 1 ? "gradient" : "primaryForeground"}
          className="w-full mb-8"
        >
          خرید اشتراک
        </Button>

        <div className="space-y-3 text-sm font-medium">
          <Separator />
          <div>دانلود منصفانه: {failDownload} عدد</div>
          <Separator />
          <ul className="text-xs text-muted-foreground space-y-1.5">
            {subOptions.map((i, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CircleCheck
                  size={13}
                  className={cn(
                    (idx === subOptions.length - 1 ||
                      idx === subOptions.length - 2) &&
                      index === 0
                      ? "text-muted-foreground"
                      : "text-green-600"
                  )}
                />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const subOptions = [
  "دسترسی به تمام قالب ها",
  "ذخیره نامحدود قالب ها",
  "دانلود فرمت دلخواه",
  "انتخاب متریال چاپ",
  "انتخاب نوع ابعاد",
  "دریافت فایل بدون واترمارک",
  "تنظیم ضخامت سفارشی",
  "انتخاب میزان بلید",
];
