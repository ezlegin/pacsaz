import { DiscountInfo } from "@/hooks/usePaymentCheckout";
import { DiscountFormType, discountFormSchema } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useLoading } from "@repo/lib/utils/useLoading";

interface Props {
  appliedDiscountCode: string | undefined;
  setAppliedDiscountCode: (val: string | undefined) => void;
  discountInfo: DiscountInfo;
}

const DiscountForm = ({
  discountInfo,
  setAppliedDiscountCode,
  appliedDiscountCode,
}: Props) => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const form = useForm<DiscountFormType>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      discountCode: "",
    },
  });

  const discountCode = useWatch({
    control: form.control,
    name: "discountCode",
  });

  const applyDiscountCode = () => {
    startLoading();

    if (appliedDiscountCode) {
      setAppliedDiscountCode(undefined);
      form.resetField("discountCode");
      toast.info("کد تخفیف با موفقیت حذف شد.");
      stopLoading();
    } else if (discountCode) {
      setAppliedDiscountCode(discountCode);
      stopLoading();
    }
  };

  useEffect(() => {
    if (discountInfo.error) {
      toast.error(discountInfo.error);
    }
    if (discountInfo.success) {
      toast.success(discountInfo.success);
    }
  }, [discountInfo]);

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
                    onClick={applyDiscountCode}
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
