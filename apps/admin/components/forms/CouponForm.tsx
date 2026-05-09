"use client";

import { createCoupon } from "@/actions/coupon";
import { CouponType } from "@/app/(PANEL)/coupons/CouponsList";
import {
  couponFormSchema,
  CouponFormType,
  couponTypes,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tarrif } from "@repo/db";
import { handleRes } from "@repo/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import { Checkbox } from "@repo/ui/components/checkbox";
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
import { addWeeks, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";

export function CouponForm({
  coupon,
  tarrif,
}: {
  coupon?: CouponType;
  tarrif: Tarrif[];
}) {
  const router = useRouter();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<CouponFormType>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      amount: coupon?.amount.toString() ?? "0",
      code: coupon?.code ?? "",
      expiresAt: coupon?.expiresAt ?? addWeeks(new Date(), 1),
      limit: coupon?.limit?.toString() ?? "0",
      plans: coupon?.tarrif.map((p) => p.id.toString()) ?? [],
      type: coupon?.type ?? "percent",
    },
  });

  const onSubmit = async (data: CouponFormType) => {
    startLoading();

    const res = coupon ? await createCoupon(data) : await createCoupon(data);
    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {couponTypes.map((i, idx) => (
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
          name="limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limit</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
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
          name="plans"
          render={({ field }) => (
            <div className="max-h-35 overflow-y-auto">
              {tarrif.map((item, idx) => {
                const isChecked = field.value.includes(item.id.toString());

                return (
                  <FormItem
                    key={idx}
                    className="flex flex-row items-center gap-3 pb-1.5"
                  >
                    <FormControl>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const updatedFeatures = checked
                            ? [...field.value, item.id.toString()]
                            : field.value.filter(
                                (i) => i !== item.id.toString(),
                              );

                          field.onChange(updatedFeatures);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      {item.title}
                    </FormLabel>
                  </FormItem>
                );
              })}
            </div>
          )}
        />

        <SubmitButton
          form={form}
          isLoading={isLoading}
          label={coupon ? "Update" : "Create"}
        />
      </form>
    </Form>
  );
}
