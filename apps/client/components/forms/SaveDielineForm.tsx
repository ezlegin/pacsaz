"use client";

import { DIMENSIONS_TYPE } from "@/data/consts";
import { useLoading } from "@repo/lib/utils/useLoading";
import {
  SaveDielineFormType,
  saveDielineFormSchema,
} from "@/lib/validatoinSchema";
import Diamond from "@/public/icons/Diamond";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@repo/store/app/user.store";
import {
  getDielineSettings,
  useDielineSettingsStore,
} from "@repo/store/dieline/dielineSettings.store";
import { Badge } from "@repo/ui/components/badge";
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
  const { thickness, bleed, dimensionType, material } = getDielineSettings();
  const { isPremium } = useUserStore();

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
      thickness,
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
    thickness,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <DialogTitle>ذخیره قالب</DialogTitle>
        {!isPremium && (
          <Badge variant={"lightRed"} className="p-2 px-4">
            <Diamond />
            فقط در اشتراک حرفه ای و سازمانی
          </Badge>
        )}
      </div>

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
            ضخامت:
            {thickness}mm
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
                  <Input disabled={!isPremium} {...field} placeholder="عنوان" />
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
                  <Input
                    disabled={!isPremium}
                    {...field}
                    placeholder="توضیح کوتاه"
                  />
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
                  <Input
                    disabled={!isPremium}
                    {...field}
                    placeholder="مشتری (دلخواه)"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            size={"lg"}
            disabled={!form.formState.isValid || isLoading || !isPremium}
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
