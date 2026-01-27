import { dimensionTypeGuide } from "@/public";
import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import Image from "next/image";

const DimensionTypeGuide = () => {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-right">نوع ابعاد</DialogTitle>
      <span className="text-xs text-muted-foreground">
        در این بخش می‌توانید مشخص کنید ابعادی که وارد می‌کنید بر چه اساسی محاسبه
        شوند:
      </span>
      <DialogDescription className="text-right mt-4">
        <span className="font-semibold text-foreground block">ابعاد داخلی</span>
        <span className="text-xs">
          مناسب زمانی است که فضای دقیق مورد نیاز برای قرارگیری محصول داخل جعبه
          اهمیت دارد.
        </span>
      </DialogDescription>
      <DialogDescription className="text-right">
        <span className="font-semibold text-foreground block">ابعاد خارجی</span>
        <span className="text-xs">
          ابعاد نهایی جعبه بعد از ساخت را نشان می‌دهد و برای چیدمان، حمل‌ونقل و
          انبارداری کاربرد دارد.
        </span>
      </DialogDescription>
      <DialogDescription className="text-right">
        <span className="font-semibold text-foreground block">ابعاد تولید</span>
        <span className="text-xs">
          دقیق‌ترین حالت محاسبه بر اساس دایلاین، ضخامت متریال و خط‌های تا و برش
          است؛ مناسب چاپخانه و تولید.
        </span>
      </DialogDescription>

      <Image
        alt="img"
        src={dimensionTypeGuide}
        width={800}
        height={800}
        className="w-full h-auto"
      />
    </div>
  );
};

export default DimensionTypeGuide;
