import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";

const FormatGuide = () => {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-right">فرمت خروجی</DialogTitle>
      <span className="text-xs text-muted-foreground">
        فرمت خروجی مشخص می‌کند فایل دایلاین برای چه نرم‌افزار یا مرحله‌ای از کار
        استفاده می‌شود:
      </span>
      <DialogDescription className="text-right mt-4">
        <span className="font-semibold text-foreground block">PDF</span>
        <span className="text-xs">
          مناسب مشاهده، چاپ و ارسال به چاپخانه. رایج‌ترین و قابل اعتمادترین
          فرمت.
        </span>
      </DialogDescription>
      <DialogDescription className="text-right">
        <span className="font-semibold text-foreground block">
          AI (Adobe Illustrator)
        </span>
        <span className="text-xs">
          مناسب ویرایش گرافیکی، طراحی نهایی و اعمال رنگ و طرح روی دایلاین.
        </span>
      </DialogDescription>
      <DialogDescription className="text-right">
        <span className="font-semibold text-foreground block">DXF</span>
        <span className="text-xs">
          مناسب دستگاه‌های برش و قالب‌سازی (CNC و لیزر) و استفاده‌های صنعتی.
        </span>
      </DialogDescription>
    </div>
  );
};

export default FormatGuide;
