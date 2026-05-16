import { getCouponByCode } from "@/data/coupon";
import { DiscountFormType, discountFormSchema } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tarrif } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { Dispatch, SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  tarrif: Tarrif;
  basePrice: number;
  appliedDiscountCode: string | null;
  setAppliedDiscountCode: (val: string | null) => void;
  setTotalPrice: Dispatch<SetStateAction<number>>;
  setDiscountCodeAmount: Dispatch<SetStateAction<number>>;
}

const DiscountForm = ({
  setAppliedDiscountCode,
  setDiscountCodeAmount,
  setTotalPrice,
  appliedDiscountCode,
  basePrice,
  tarrif,
}: Props) => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const form = useForm<DiscountFormType>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountCode: "",
    },
  });

  const formCode = useWatch({
    control: form.control,
    name: "discountCode",
  });

  const applyDiscount = async () => {
    startLoading();

    if (appliedDiscountCode) {
      setAppliedDiscountCode("");
      form.setValue("discountCode", "");
      setTotalPrice(basePrice);
      setDiscountCodeAmount(0);
      toast.info("کد تخفیف حذف شد.");
      stopLoading();
      return;
    }

    try {
      const coupon = await getCouponByCode(formCode);
      if (!coupon) {
        throw new Error("کد تخفیف نا معتبر می باشد.");
      }
      if (coupon.expiresAt < new Date()) {
        throw new Error("کد تخفیف منقضی شده است.");
      }
      if (coupon.limit && coupon.used >= coupon.limit) {
        throw new Error("این کد تخفیف به حداکثر تعداد استفاده رسیده است.");
      }
      const isCouponValidForThisPlan = coupon.tarrif.some(
        (p) => p.key === tarrif?.key,
      );
      if (coupon.tarrif.length > 0 && !isCouponValidForThisPlan) {
        throw new Error(`این کد تخفیف برای این پلن اشتراک معتبر نمی باشد.`);
      }

      switch (coupon.type) {
        case "fixed": {
          const discountAmount =
            coupon.amount > basePrice ? basePrice : coupon.amount;
          setDiscountCodeAmount(discountAmount);
          setTotalPrice(basePrice - discountAmount);
          break;
        }

        case "percent": {
          const factor = 1 - coupon.amount / 100;
          const discountAmount = basePrice - basePrice * factor;
          setDiscountCodeAmount(discountAmount);
          setTotalPrice(basePrice * factor);
          break;
        }
      }

      toast.success("کد تخفیف با موفقیت اعمال شد.");
      setAppliedDiscountCode(formCode);
    } catch (error) {
      toast.error((error as Error).message);
      form.setValue("discountCode", "");
    }

    stopLoading();
  };

  return (
    <Form {...form}>
      <form className="space-y-5">
        <FormField
          control={form.control}
          name="discountCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="کد تخفیف..."
                    disabled={!!appliedDiscountCode}
                    {...field}
                  />

                  <Button
                    type="button"
                    variant={"ghost"}
                    size={"sm"}
                    className="absolute left-1 top-1/2 -translate-y-1/2"
                    onClick={applyDiscount}
                    disabled={!form.formState.isValid || isLoading}
                  >
                    {isLoading ? (
                      <Spinner />
                    ) : appliedDiscountCode ? (
                      "حذف"
                    ) : (
                      "بررسی"
                    )}
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default DiscountForm;
