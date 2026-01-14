"use client";

import { usePaymentCheckout } from "@/hooks/useSubscriptionCheckout";
import {
  paymentStatus,
  planKey,
  planPeriod,
  subscriptionFormSchema,
  SubscriptionFormType,
} from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import Card from "@repo/ui/components/custom/Card";

export function PaymentForm() {
  const [paymentInfo, setPaymentInfo] = useState<{
    amount: number;
    discountAmount: number;
    total: number;
  }>({ amount: 0, discountAmount: 0, total: 0 });

  const [discountCode, setDiscountCode] = useState("");

  const form = useForm<SubscriptionFormType>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      userId: "",
      planKey: "standard",
      period: "monthly",
      date: new Date(),
      discountCode: "",
      status: "success",
    },
  });

  function onSubmit(data: SubscriptionFormType) {
    console.log({
      ...data,
      ...paymentInfo,
    });
  }

  const plan = form.watch("planKey");
  const period = form.watch("period");

  useEffect(() => {
    const checkout = usePaymentCheckout({
      plan,
      period,
      discountCode,
    });

    if (checkout.error) {
      toast.error(checkout.error);
    }

    if (checkout.paymentInfo) setPaymentInfo(checkout.paymentInfo);
  }, [plan, period, discountCode]);

  const code = form.watch("discountCode");

  const applyDiscount = () => {
    if (discountCode) {
      setDiscountCode("");
      form.setValue("discountCode", "");
      return;
    }

    if (code) setDiscountCode(code);
  };

  const checkout = [
    { title: "Amount:", value: formatPrice(paymentInfo.amount) },
    { title: "Discount:", value: formatPrice(paymentInfo.discountAmount) },
    { title: "Total:", value: formatPrice(paymentInfo.total) },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 max-w-sm"
      >
        {/* //todo: Search users and select a user id */}
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
          disabled={!form.formState.isValid}
          className="w-full"
        >
          Create
        </Button>
      </form>
    </Form>
  );
}
