"use client";

import {
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
import { useForm } from "react-hook-form";
import PageTitle from "../PageTitle";

export function SubscriptionForm() {
  const form = useForm<SubscriptionFormType>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      userId: "",
      planKey: "standard",
      period: "monthly",
    },
  });

  function onSubmit(data: SubscriptionFormType) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <PageTitle title="New Subscription" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* //todo: Search users and select a user id */}
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
