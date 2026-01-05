import { DialogDescription, DialogTitle } from "@repo/ui/components/dialog";
import React from "react";

const DimensionInfo = () => {
  return (
    <>
      <DialogTitle className="text-right">راهنمای ابعاد بسته بندی</DialogTitle>
      <DialogDescription className="text-right">
        در تصویر زیر نمونه ای از طول، عرض و ارتفاع جعبه‌ها، کیف‌ها و بطری‌های
        رایج آمده است.
      </DialogDescription>
    </>
  );
};

export default DimensionInfo;
