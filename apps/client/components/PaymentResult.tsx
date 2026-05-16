"use client";

import { verifyPayment } from "@/actions/payment";
import { ZarinPalStatus } from "@/lib/zarrinpal";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Spinner } from "@repo/ui/components/spinner";
import { CircleCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "success" | "failed" | "pending";

const PaymentResult = ({
  authority,
  status: zpStatus,
}: {
  authority: string;
  status: ZarinPalStatus;
}) => {
  const [status, setStatus] = useState<Status>("pending");
  const [text, setText] = useState("در حال بررسی اطلاعات...");

  useEffect(() => {
    if (!authority) {
      setStatus("failed");
      setText("توکن پرداخت یافت نشد.");
      return;
    }

    const Verify = async () => {
      const res = await verifyPayment(authority, zpStatus);
      setStatus(res.result as Status);
      setText(res.message);
    };

    Verify();
  }, []);

  const icon = {
    pending: <Spinner className="scale-[3.5] text-primary" />,
    success: <CircleCheck className="text-green-500" size={74} />,
    failed: <XCircle className="text-red-500" size={74} />,
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md pb-1 flex justify-center items-center">
        <div className="w-full  flex flex-col gap-4 justify-center items-center py-5">
          {icon[status]}
          <div className="text-center pt-2">
            <span className="text-xl font-medium">{text}</span>
            <p className="text-sm text-muted-foreground">
              {status === "failed" &&
                "در صورت کسر وجه مبلغ پرداخت شده حداکثر تا 72 ساعت آینده به حساب شما برگشت خواهد خورد."}
            </p>
          </div>
          {status !== "success" && (
            <Link href={"/"} className="w-full">
              <Button className="w-full" size={"xl"} variant={"outline"}>
                صفحه اصلی
              </Button>
            </Link>
          )}
          {status === "success" && (
            <Link href={"/panel"} className="w-full">
              <Button size={"xl"} className="w-full">
                اشتراک های من
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentResult;
