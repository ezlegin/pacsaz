"use client";

import { updateDielineSettings } from "@/actions/dieline";
import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import {
  dielineSettingsFormSchema,
  DielineSettingsFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Checkbox } from "@repo/ui/components/checkbox";
import { DialogTitle } from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";
import { Switch } from "@repo/ui/components/switch";
import { handleRes } from "@repo/lib/utils/handleRes";

const DielineSettingsForm = ({
  dieline,
  categories,
}: {
  dieline: DielineType;
  categories: Categories;
}) => {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const form = useForm<DielineSettingsFormType>({
    resolver: zodResolver(dielineSettingsFormSchema),
    defaultValues: {
      title: dieline.title ?? "",
      slug: dieline.slug ?? "",
      active: dieline.active ?? false,
      categoryByModel:
        dieline.categoryByModel.length > 0
          ? dieline.categoryByModel.map((i) => i.slug)
          : [],
      categoryByUsage:
        dieline.categoryByUsage.length > 0
          ? dieline.categoryByUsage.map((i) => i.slug)
          : [],
    },
  });

  const onSubmit = async (data: DielineSettingsFormType) => {
    startLoading();

    const res = await updateDielineSettings(data, dieline.id);
    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  return (
    <Form {...form}>
      <div className="flex justify-between">
        <DialogTitle>Settings</DialogTitle>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
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

        <div className="space-y-2">
          <Label>Categories By Model</Label>
          <FormField
            control={form.control}
            name="categoryByModel"
            render={({ field }) => (
              <div className="grid grid-cols-4">
                {categories.byModel.map((cat, idx) => {
                  const isChecked = field.value.includes(cat.slug);
                  return (
                    <FormItem
                      key={idx}
                      className="flex flex-row items-center gap-3 pb-1.5"
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const cats = field.value;
                            const updatedMaterials = checked
                              ? [...cats, cat.slug]
                              : cats.filter((i) => i !== cat.slug);

                            field.onChange(updatedMaterials);
                          }}
                        />
                      </FormControl>
                      <FormLabel>{cat.title}</FormLabel>
                    </FormItem>
                  );
                })}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label>Categories By Usage</Label>
            <FormField
              control={form.control}
              name="categoryByUsage"
              render={({ field }) => (
                <div className="grid grid-cols-4">
                  {categories.byUsage.map((cat, idx) => {
                    const isChecked = field.value.includes(cat.slug);
                    return (
                      <FormItem
                        key={idx}
                        className="flex flex-row items-center gap-3 pb-1.5"
                      >
                        <FormControl>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const cats = field.value;
                              const updatedMaterials = checked
                                ? [...cats, cat.slug]
                                : cats.filter((i) => i !== cat.slug);

                              field.onChange(updatedMaterials);
                            }}
                          />
                        </FormControl>
                        <FormLabel>{cat.title}</FormLabel>
                      </FormItem>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>

        <SubmitButton isLoading={isLoading} form={form} label="Update" />
      </form>
    </Form>
  );
};

export default DielineSettingsForm;
