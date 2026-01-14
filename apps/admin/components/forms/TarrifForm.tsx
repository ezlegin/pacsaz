"use client";

import { tarrifFormSchema, TarrifFormType } from "@/lib/validatoinSchema";
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
import { useForm } from "react-hook-form";

function TarrifForm() {
  const form = useForm<TarrifFormType>({
    resolver: zodResolver(tarrifFormSchema),
    defaultValues: {
      monthly: "399000",
      threeMonth: "699000",
      annual: "1399000",
    },
  });

  function onSubmit(data: TarrifFormType) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="monthly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="threeMonth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>3-Month</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          size={"lg"}
          disabled={!form.formState.isValid || !form.formState.isDirty}
          className="w-full"
        >
          Save Tarrif
        </Button>
      </form>
    </Form>
  );
}

export default TarrifForm;
