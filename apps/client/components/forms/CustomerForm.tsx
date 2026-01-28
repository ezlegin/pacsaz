"use client";

import { useLoading } from "@repo/lib/utils/useLoading";
import { customerFormSchema, CustomerFormType } from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm } from "react-hook-form";
import { FormType } from "@repo/lib/data/types";
import DeleteButton from "@repo/ui/components/custom/DeleteButton";
import { DialogTitle } from "@repo/ui/components/dialog";
import { Customer } from "@repo/db";

export function CustomerForm({
  type,
  customer,
}: {
  customer?: Customer;
  type: FormType;
}) {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const form = useForm<CustomerFormType>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: customer?.fullName ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
      phoneNumber: customer?.phoneNumber ?? "",
    },
  });

  function onSubmit(data: CustomerFormType) {
    startLoading();
    console.log(data);
    stopLoading();
  }

  return (
    <div className="space-y-4">
      <DialogTitle>{type === "create" ? "مشتری جدید" : "مشتری"}</DialogTitle>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span>نام و نام خانوادگی</span>
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شماره تماس</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={11}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>آدرس</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3">
            <Button
              size={"lg"}
              disabled={!form.formState.isValid || isLoading}
              className="w-full"
            >
              {isLoading && <Spinner />}
              {type === "create" ? "ایجاد مشتری جدید" : "ذخیره اطلاعات"}
            </Button>

            {type === "update" && <DeleteButton lang="fa" />}
          </div>
        </form>
      </Form>
    </div>
  );
}
