import Card from "@repo/ui/components/custom/Card";
import { Badge } from "@repo/ui/components/badge";
import {
  Ruler,
  Zap,
  Layers,
  FileDown,
  Settings,
  CheckCircle2,
  File,
} from "lucide-react";
import Icon from "../Icon";
import HomeTitle from "./HomeTitle";

export default function FeaturesSection() {
  return (
    <div className="flex flex-col items-center gap-8">
      <HomeTitle
        title="با پک‌ساز بیشتر آشنا شوید!"
        description="پک‌ساز ابزار آنلاین ساخت دایلاین بسته‌بندی با ویژگی‌های منحصربه‌فرد است که فرایند طراحی بسته‌بندی را سریع، دقیق و آسان می‌کند."
      />
      <div className="grid grid-cols-6 grid-rows-4 gap-4 mx-auto">
        <Card className="col-span-2 row-span-4 flex flex-col justify-between">
          <div className="space-y-3">
            <Icon icon={Ruler} size={28} />
            <h3 className="text-lg font-semibold">
              دایلاین دقیق، بدون آزمون و خطا
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              پک‌ساز دایلاین‌های بسته‌بندی را بر اساس ابعاد واقعی، بلید
              استاندارد و اصول فنی چاپ تولید می‌کند؛ دقیقاً همان چیزی که چاپخانه
              نیاز دارد.
            </p>
          </div>

          <ul className="space-y-1.5">
            {[
              "آماده‌ی تولید صنعتی",
              "پشتیبانی از فایل‌های AI",
              "قابلیت شخصی‌سازی",
            ].map((i, idx) => (
              <li
                key={idx}
                className="text-xs text-muted-foreground flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                {i}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          primaryTheme
          className="col-span-2 flex items-center justify-between gap-6"
        >
          <div className="space-y-2 flex items-center gap-4">
            <Icon icon={Zap} size={28} />
            <div>
              <h4 className="text-lg font-semibold">سرعت بالا</h4>

              <p className="text-sm text-muted-foreground">
                ساخت دایلاین در چند ثانیه، نه چند ساعت.
              </p>
            </div>
          </div>
        </Card>

        <Card className="col-span-2 row-span-3 flex flex-col justify-between">
          <div className="space-y-3">
            <Icon icon={Layers} size={28} />
            <h4 className="text-lg font-semibold">ساختار لایه‌بندی شده</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              خطوط برش، تا، بلید و راهنما به‌صورت تفکیک‌شده و استاندارد در
              اختیار شما قرار می‌گیرند.
            </p>
          </div>

          <ul className="text-xs text-muted-foreground space-y-2 list-inside list-disc">
            <li>خطوط برش مجزا</li>
            <li>بلید قابل تنظیم</li>
            <li>سازگار با Illustrator</li>
          </ul>
        </Card>

        <Card className="col-span-2 row-span-2 flex flex-col gap-2">
          <Icon icon={Settings} size={28} />
          <h4 className="text-lg font-semibold">شخصی‌سازی کامل</h4>
          <p className="text-sm text-muted-foreground">
            انتخاب متریال، ضخامت، ابعاد و میزان بلید متناسب با پروژه.
          </p>
        </Card>

        <Card
          primaryTheme
          className="col-span-4 flex items-center justify-between gap-6"
        >
          <div className="space-y-2 flex items-center gap-4">
            <Icon icon={FileDown} size={28} />
            <div>
              <h4 className="text-lg font-semibold">خروجی حرفه‌ای</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                دریافت فایل‌های وکتور آماده برای طراحی گرافیک یا ارسال مستقیم به
                چاپخانه.
              </p>
            </div>
          </div>

          <Badge variant={"primaryForeground"}>
            SVG / PDF / AI-ready
            <File />
          </Badge>
        </Card>
      </div>
    </div>
  );
}
