"use client";

import { useLoading } from "@/hooks/useLoading";
import {
  SaveDielineFormType,
  saveDielineFormSchema,
} from "@/lib/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DIMENSIONS_TYPE } from "@repo/dieline-core/data/consts";
import {
  getDielineSettings,
  useDielineSettingsStore,
} from "@repo/store/dieline/dielineSettings.store";
import { Button } from "@repo/ui/components/button";
import { DialogTitle } from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { useForm } from "react-hook-form";

const SaveDielineForm = () => {
  const {
    settings: { dimension },
  } = useDielineSettingsStore();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { customThickness, bleed, dimensionType, material } =
    getDielineSettings();

  const form = useForm<SaveDielineFormType>({
    resolver: zodResolver(saveDielineFormSchema),
    defaultValues: {
      title: "",
      description: "",
      customer: "",
    },
  });

  const onSubmit = (data: SaveDielineFormType) => {
    startLoading();
    const finalData = {
      ...data,
      bleed,
      thickness: customThickness ?? material.thickness,
      dimensionType,
      material,
      dimension,
    };
    console.log(finalData);
    stopLoading();
  };

  const selectedDimensionType = DIMENSIONS_TYPE.find(
    (d) => d.key === dimensionType
  );

  const data = {
    width: dimension.raw.width,
    length: dimension.raw.length,
    height: dimension.raw.height,
    bleedSize: bleed,
    material: material.label,
    dimensionType: selectedDimensionType,
    thickness: material.thickness,
    customThickness: customThickness,
  };

  return (
    <div className="p-6 space-y-5">
      <DialogTitle>ذخیره قالب</DialogTitle>

      <ul className="text-sm text-muted-foreground space-y-2 border p-3 rounded-md px-0">
        <div className="flex justify-between px-3">
          <li>عرض: {data.width}mm</li>
          <li>طول: {data.length}mm</li>
          <li>ارتفاع: {data.height}mm</li>
          <li>نوع ابعاد: {data.dimensionType?.label}</li>
        </div>

        <Separator />

        <div className="flex justify-between px-3">
          <li>بلید: {data.bleedSize}mm</li>
          <li>متریال: {data.material}</li>
          <li>
            ضخامت:{" "}
            {data.customThickness
              ? `${data.customThickness.toFixed(1)}mm (سفارشی)`
              : `${data.thickness}mm (پیش‌فرض)`}
          </li>
        </div>
      </ul>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="عنوان" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="توضیح کوتاه" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer" //todo: do search the customer
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="مشتری (دلخواه)" />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            size={"lg"}
            disabled={!form.formState.isValid || isLoading}
            className="w-full"
          >
            ذخیره
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SaveDielineForm;
