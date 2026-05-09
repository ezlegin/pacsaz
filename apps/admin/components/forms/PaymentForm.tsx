"use client";

import { createPayment } from "@/actions/payment";
import { PaymentType } from "@/app/(PANEL)/payments/PaymentsList";
import { getCouponByCode } from "@/data/coupon";
import {
  paymentFormSchema,
  PaymentFormType,
  paymentStatus,
  planKey,
  planPeriod,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Price, Tarrif } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { handleRes } from "@repo/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import Card from "@repo/ui/components/custom/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TarrifType extends Tarrif {
  price: Price | null;
}

export function PaymentForm({
  tarrif,
  payment,
}: {
  tarrif: TarrifType[];
  payment?: PaymentType | null;
}) {
  const router = useRouter();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const form = useForm<PaymentFormType>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      userId: payment?.userId.toString() ?? "",
      planKey: payment?.plan.key ?? "standard",
      period: payment?.plan.period ?? "monthly",
      from: payment?.plan.startedAt ?? new Date(),
      discountCode: payment?.coupon?.code ?? "",
      status: payment?.status ?? "success",
      amount: payment?.amount ?? 0,
      discountCodeAmount: payment?.discountCodeAmount ?? 0,
      total: payment?.total ?? 0,
    },
  });

  const onSubmit = async (data: PaymentFormType) => {
    startLoading();

    const res = payment ? await createPayment(data) : await createPayment(data);

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  const plan = form.watch("planKey");
  const period = form.watch("period");
  const tarrifPlan = tarrif.find((t) => t.key === plan);
  const rawTotal = tarrifPlan?.price![period] ?? 0;

  useEffect(() => {
    if (!tarrifPlan) {
      toast.error("Tarrif not available.");
      return;
    }

    form.setValue("amount", tarrifPlan.price![period]);
    form.setValue("discountCodeAmount", 0);
    form.setValue("total", rawTotal);
  }, [plan, period]);

  const formCode = form.watch("discountCode");

  const applyDiscount = async () => {
    if (discountCode) {
      setDiscountCode("");
      form.setValue("discountCode", "");
      form.setValue("discountCodeAmount", 0);
      form.setValue("total", rawTotal);
      toast.info("Coupon Removed.");
      return;
    }

    const coupon = await getCouponByCode(formCode);
    try {
      if (!coupon) {
        throw new Error("Coupon Invalid.");
      }
      if (coupon.expiresAt < new Date()) {
        throw new Error("Coupon Expired.");
      }
      if (coupon.used >= coupon.limit) {
        throw new Error("Coupon Limit Has Reached.");
      }
      const isCouponValidForThisPlan = coupon.plan.some(
        (p) => p.key === tarrifPlan?.key,
      );
      const validPlans = coupon.plan.map((p) => p.key).join(", ");
      if (!isCouponValidForThisPlan) {
        throw new Error(
          `This coupon is not valid for this plan. valid plans are: ${validPlans}`,
        );
      }

      switch (coupon.type) {
        case "fixed": {
          const discountAmount =
            coupon.amount > rawTotal ? rawTotal : coupon.amount;
          form.setValue("discountCodeAmount", discountAmount);
          form.setValue("total", rawTotal - discountAmount);
          break;
        }

        case "percent": {
          const factor = 1 - coupon.amount / 100;
          const discountAmount = rawTotal - rawTotal * factor;
          form.setValue("discountCodeAmount", discountAmount);
          form.setValue("total", rawTotal * factor);
          break;
        }
      }

      toast.success("Discount Code Applied.");
      setDiscountCode(formCode);
    } catch (error) {
      toast.error((error as Error).message);
      form.setValue("discountCode", "");
    }
  };

  const checkout = [
    { title: "Amount:", value: formatPrice(form.watch("amount"), true, "en") },
    {
      title: "Discount:",
      value: formatPrice(form.watch("discountCodeAmount"), true, "en"),
    },
    { title: "Total:", value: formatPrice(form.watch("total"), true, "en") },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 max-w-sm"
      >
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            <FormItem className="flex flex-col py-1">
              <FormLabel>From / To</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        <div className="flex gap-1">
                          {format(field.value || new Date(), "MMMM dd")}
                        </div>
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 en-digits" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    // initialFocus
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="planKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {planKey.map((i, idx) => (
                      <SelectItem key={idx} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {planPeriod.map((i, idx) => (
                      <SelectItem key={idx} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentStatus.map((i, idx) => (
                      <SelectItem key={idx} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Code</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input disabled={!!discountCode} {...field} />
                  <Button
                    type="button"
                    variant={"ghost"}
                    size={"sm"}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={applyDiscount}
                    disabled={field.value === ""}
                  >
                    {discountCode ? "Remove" : "Apply"}
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <Card className="col-span-3 h-fit">
          {checkout.map((i, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{i.title}</span> <span>{i.value}</span>
            </li>
          ))}
        </Card>

        <Button
          size={"lg"}
          disabled={!form.formState.isValid || isLoading}
          className="w-full"
        >
          Create
        </Button>
      </form>
    </Form>
  );
}
