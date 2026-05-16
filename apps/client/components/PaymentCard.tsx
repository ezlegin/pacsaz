"use client";

import { createPayment } from "@/actions/payment";
import { PlanPeriod, Price, Tarrif } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Spinner } from "@repo/ui/components/spinner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import DiscountForm from "./forms/DiscountForm";

interface TarrifType extends Tarrif {
  price: Price | null;
}

const PaymentCard = ({
  tarrif,
  period,
}: {
  tarrif: TarrifType;
  period: PlanPeriod;
}) => {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(
    null,
  );
  const [discountCodeAmount, setDiscountCodeAmount] = useState(0);
  const basePrice = tarrif.price?.[period] ?? 0;
  const [totalPrice, setTotalPrice] = useState(basePrice);

  const onStartPayment = async () => {
    startLoading();
    const res = await createPayment({
      total: totalPrice,
      amount: tarrif.price![period],
      plan: tarrif.key,
      period,
      discountCode: appliedDiscountCode,
      discountCodeAmount,
    });

    if (res.error) {
      toast.error(res.error);
      stopLoading();
    } else if (res.success) {
      router.push(res.data.paymentUrl);
    }
  };
  // todo: implement applying discount code.

  return (
    <div className="flex justify-center">
      <Card className="relative min-w-sm mt-10 pt-26 space-y-3">
        <Image
          alt=""
          src={`/icons/period/${tarrif.key}-${period}.png`}
          width={400}
          height={400}
          className="w-30 h-auto absolute -top-10 right-1/2 translate-x-1/2"
        />
        <p className="text-center text-muted-foreground">
          {tarrif.shortDescription}
        </p>

        <ul>
          <li className="flex justify-between border-b py-3 text-muted-foreground">
            <span>هزینه اشتراک:</span>
            <span>{formatPrice(basePrice, true)}</span>
          </li>
          <li className="flex justify-between border-b py-3 text-muted-foreground">
            <span>تخفیف:</span>
            <span>{formatPrice(discountCodeAmount, true)}</span>
          </li>
          <li className="flex justify-between border-b py-3 font-medium">
            <span>قابل پرداخت:</span>
            <span>{formatPrice(totalPrice, true)}</span>
          </li>
        </ul>

        <DiscountForm
          setDiscountCodeAmount={setDiscountCodeAmount}
          tarrif={tarrif}
          basePrice={basePrice}
          setTotalPrice={setTotalPrice}
          appliedDiscountCode={appliedDiscountCode}
          setAppliedDiscountCode={setAppliedDiscountCode}
        />

        <Button
          onClick={onStartPayment}
          size={"xl"}
          className="w-full"
          variant={"gradient"}
          disabled={isLoading}
        >
          {isLoading && <Spinner />}
          پرداخت {formatPrice(totalPrice, true)}
        </Button>
      </Card>
    </div>
  );
};

export default PaymentCard;
