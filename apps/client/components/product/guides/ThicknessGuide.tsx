import { thicknessGuide } from "@/public";
import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import Image from "next/image";

const ThicknessGuide = () => {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-right">ضخامت چیست؟</DialogTitle>
      <DialogDescription className="text-right text-xs">
        ضخامت متریال (Thickness) به میزان ضخامت مقوا یا کارتن استفاده‌شده در
        بسته‌بندی گفته می‌شود. این مقدار مستقیماً روی استحکام جعبه، کیفیت
        تاخوردگی‌ها و ابعاد نهایی تأثیر می‌گذارد. هرچه ضخامت بیشتر باشد، جعبه
        مقاوم‌تر است، اما ممکن است فضای داخلی کمی کاهش پیدا کند و دقت در طراحی
        دایلاین اهمیت بیشتری پیدا کند.
      </DialogDescription>

      <Image
        alt="img"
        src={thicknessGuide}
        width={800}
        height={800}
        className="w-full h-auto"
      />
    </div>
  );
};

export default ThicknessGuide;
