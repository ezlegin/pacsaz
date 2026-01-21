import { thicknessGuide } from "@/public";
import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import Image from "next/image";

const MeterialGuide = () => {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-right"> متریال بسته‌بندی چیست؟</DialogTitle>
      <DialogDescription className="text-right text-xs">
        متریال بسته‌بندی به نوع کاغذ، مقوا یا کارتن گفته می‌شود که جعبه از آن
        ساخته می‌شود. انتخاب متریال مناسب تأثیر مستقیمی بر استحکام، وزن، ظاهر،
        هزینه و کاربرد نهایی بسته‌بندی دارد. هر متریال ویژگی‌های خاص خودش را
        دارد؛ بعضی سبک و اقتصادی هستند، بعضی مقاوم و مناسب حمل‌ونقل، و بعضی برای
        ظاهر لوکس و چاپ باکیفیت استفاده می‌شوند.
      </DialogDescription>

      <Image
        alt="img"
        src={thicknessGuide}
        width={800}
        height={800}
        className="w-full mx-auto"
      />
    </div>
  );
};

export default MeterialGuide;
