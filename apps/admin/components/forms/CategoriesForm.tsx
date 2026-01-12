"use client";

import {
  categoriesFormSchema,
  CategoriesFormType,
} from "@/lib/validatoinSchema";
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

export function CategoriesForm({ by }: { by: "usage" | "model" }) {
  const form = useForm<CategoriesFormType>({
    resolver: zodResolver(categoriesFormSchema),
    defaultValues: {
      title: "",
      slug: "",
    },
  });

  function onSubmit(data: CategoriesFormType) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <PageTitle title={`New Category By ${by}`} />

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
