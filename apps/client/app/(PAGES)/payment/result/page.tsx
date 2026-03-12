"use client";

import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Spinner } from "@repo/ui/components/spinner";
import React, { useEffect, useState } from "react";

const page = () => {
  const [paymentResultTrue, _] = useState(true);
  const tempData = {
    total: 299000,
    amount: 299000,
    discountCodeAmount: 0,
    discountCode: null,
    plan: "standard",
    period: "monthly",
  };

  useEffect(() => {
    if (paymentResultTrue) {
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md pb-1 flex justify-center items-center">
        <div className="w-full flex flex-col gap-4 justify-center items-center py-5">
          <Spinner className="scale-[3.5] text-primary" />
          <div className="text-center pt-2">
            <span className="text-xl font-medium">در حال بررسی اطلاعات</span>
            <p className="text-sm text-muted-foreground">لطفا صبور باشید.</p>
          </div>
          <Button variant={"secondary"} className="w-full">
            مشکلی پیش آمده؟ کلیک کنید.
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default page;
