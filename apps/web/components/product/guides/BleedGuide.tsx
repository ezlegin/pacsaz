import { bleedGuide } from "@/public";
import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import Image from "next/image";
import React from "react";

const BleedGuide = () => {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-right"> Bleed (بلید) چیست؟</DialogTitle>
      <DialogDescription className="text-right text-xs">
        Bleed یا «لب‌برش» فضایی اضافه در اطراف طراحی بسته‌بندی است که برای
        جلوگیری از ایجاد لبه‌های سفید ناخواسته بعد از برش در نظر گرفته می‌شود.
        در فرآیند چاپ و برش، همیشه مقدار کمی خطا وجود دارد. Bleed کمک می‌کند حتی
        اگر برش کمی جابه‌جا شود، طرح تا لبه نهایی جعبه ادامه داشته باشد و ظاهر
        کار تمیز و حرفه‌ای باقی بماند.
      </DialogDescription>

      <Image
        alt="img"
        src={bleedGuide}
        width={800}
        height={800}
        className="w-2/3 h-auto mx-auto"
      />
    </div>
  );
};

export default BleedGuide;
