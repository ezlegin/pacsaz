"use client";

import { createCategory, updateCategory } from "@/actions/categories";
import { Category } from "@/app/(PANEL)/categories/CategoriesList";
import {
  categoriesFormSchema,
  CategoriesFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleRes } from "@repo/lib/utils/handleRes";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function CategoriesForm({
  category,
  type,
}: {
  category?: Category;
  type: "usage" | "model";
}) {
  const isUpdateType = !!category;
  const router = useRouter();

  const form = useForm<CategoriesFormType>({
    resolver: zodResolver(categoriesFormSchema),
    defaultValues: {
      title: category?.title ?? "",
      slug: category?.slug ?? "",
    },
  });

  const onSubmit = async (data: CategoriesFormType) => {
    const res = isUpdateType
      ? await updateCategory(data, type, category!.id)
      : await createCategory(data, type);

    handleRes(res, { onSuccess: () => router.refresh() });
  };

  return (
    <Form {...form}>
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
          {isUpdateType ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
