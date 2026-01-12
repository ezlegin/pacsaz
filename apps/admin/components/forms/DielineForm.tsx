"use client";

import { dielineFormSchema, DielineFormType } from "@/lib/validatoinSchema";
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
import PageTitle from "../PageTitle";

export function DielineForm() {
  const form = useForm<DielineFormType>({
    resolver: zodResolver(dielineFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      categories: {
        byModel: [],
        byUsage: [],
      },
    },
  });

  function onSubmit(data: DielineFormType) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <PageTitle title="New Dieline" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/*! //todo: implement rest of code  */}

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
