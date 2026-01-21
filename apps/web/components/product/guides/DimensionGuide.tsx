import { dimGuide } from "@/public";
import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import Image from "next/image";
import React from "react";

const DimensionGuide = () => {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-right">راهنمای ابعاد بسته بندی</DialogTitle>
      <DialogDescription className="text-right">
        <span className="font-semibold text-foreground block">طول</span>
        <span className="text-xs">
          طول معمولاً بزرگ‌ترین بُعد جعبه است و از جلو به عقب اندازه‌گیری
          می‌شود. این اندازه تعیین می‌کند که محصول در چه جهتی داخل جعبه قرار
          می‌گیرد و بیشترین تأثیر را بر فضای داخلی و ساختار کلی بسته‌بندی دارد.
        </span>
      </DialogDescription>
      <DialogDescription className="text-right">
        <h3 className="font-semibold text-foreground block">عرض</h3>
        <span className="text-xs">
          عرض فاصله بین دو طرف کناری جعبه است و معمولاً عمود بر طول اندازه‌گیری
          می‌شود. این مقدار نقش مهمی در پایداری جعبه و نحوه چیدمان محصول در داخل
          آن دارد.
        </span>
      </DialogDescription>
      <DialogDescription className="text-right">
        <h3 className="font-semibold text-foreground block">ارتفاع</h3>
        <span className="text-xs">
          ارتفاع فاصله بین کف و درِ جعبه است. این اندازه مشخص می‌کند که جعبه چه
          مقدار از زمین بلند می‌شود و برای محصولاتی با ضخامت یا حجم عمودی اهمیت
          زیادی دارد.
        </span>
      </DialogDescription>

      <Image
        alt="img"
        src={dimGuide}
        width={800}
        height={800}
        className="w-2/3 h-auto mx-auto"
      />
    </div>
  );
};

export default DimensionGuide;
