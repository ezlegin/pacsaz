"use client";

import {
  tarrifFormSchema,
  TarrifFormType,
} from "@/lib/validationSchema/validatoinSchema";
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
      standard: "399000",
      pro: "699000",
      organization: "1399000",
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
          name="standard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standard</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
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
