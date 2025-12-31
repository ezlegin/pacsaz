import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { CircleCheck, Zap } from "lucide-react";

export interface SubCardProps {
  title: string;
  price: number;
  description: string;
  failDownload: number | undefined;
}

export const SubscriptionCard = ({
  props: { description, failDownload, price, title },
  index,
  isYearly,
  discountFactor,
}: {
  props: SubCardProps;
  index: number;
  isYearly: boolean;
  discountFactor: number;
}) => {
  return (
    <div className="even:bg-primary/10 p-1 rounded-2xl group">
      {index === 1 && (
        <div className="flex justify-center items-center gap-1 text-sm pt-1.5 font-medium text-primary">
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
          <div className="space-x-1">
            <span className="font-bold text-3xl">
              {(isYearly
                ? (price * (1 - discountFactor)).toFixed()
                : price
              ).toLocaleString("en-US")}{" "}
              تومان
            </span>
            <span className="text-sm text-muted-foreground">/ ماهانه</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <Button
          variant={index === 1 ? "default" : "primaryForeground"}
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
