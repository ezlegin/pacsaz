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
      <div className="grid grid-cols-1 gap-4 mx-auto md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-4">
        <Card className="flex flex-col justify-between gap-6 md:col-span-2 lg:col-span-2 lg:row-span-4">
          <div className="space-y-3">
            <Icon icon={Ruler} size={28} />
            <h3 className="text-lg font-semibold">
              دایلاین دقیق، بدون آزمون و خطا
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
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
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <CheckCircle2 size={14} />
                {i}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          primaryTheme
          className="flex flex-col gap-4 md:col-span-2 lg:col-span-2 lg:row-span-1 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <Icon icon={Zap} size={28} />
            <div>
              <h4 className="text-lg font-semibold">سرعت بالا</h4>
              <p className="text-sm text-muted-foreground">
                ساخت دایلاین در چند ثانیه، نه چند ساعت.
              </p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between gap-6 md:col-span-2 lg:col-span-2 lg:row-span-3">
          <div className="space-y-3">
            <Icon icon={Layers} size={28} />
            <h4 className="text-lg font-semibold">ساختار لایه‌بندی شده</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              خطوط برش، تا، بلید و راهنما به‌صورت تفکیک‌شده و استاندارد در
              اختیار شما قرار می‌گیرند.
            </p>
          </div>

          <ul className="space-y-2 text-xs list-inside list-disc text-muted-foreground">
            <li>خطوط برش مجزا</li>
            <li>بلید قابل تنظیم</li>
            <li>سازگار با Illustrator</li>
          </ul>
        </Card>

        <Card className="flex flex-col gap-2 md:col-span-2 lg:col-span-2 lg:row-span-2">
          <Icon icon={Settings} size={28} />
          <h4 className="text-lg font-semibold">شخصی‌سازی کامل</h4>
          <p className="text-sm text-muted-foreground">
            انتخاب متریال، ضخامت، ابعاد و میزان بلید متناسب با پروژه.
          </p>
        </Card>

        <Card
          primaryTheme
          className="flex flex-col gap-4 md:col-span-2 lg:col-span-4 lg:row-span-1 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <Icon icon={FileDown} size={28} />
            <div>
              <h4 className="text-lg font-semibold">خروجی حرفه‌ای</h4>
              <p className="max-w-md text-sm text-muted-foreground">
                دریافت فایل‌های وکتور آماده برای طراحی گرافیک یا ارسال مستقیم به
                چاپخانه.
              </p>
            </div>
          </div>

          <Badge variant="primaryForeground" className="shrink-0">
            SVG / PDF / AI-ready
            <File />
          </Badge>
        </Card>
      </div>
    </div>
  );
}
