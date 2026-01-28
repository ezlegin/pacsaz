"use client";

import { DIMENSIONS_TYPE } from "@/data/consts";
import {
  saveDielineFormSchema,
  SaveDielineFormType,
} from "@/lib/validatoinSchema";
import Diamond from "@/public/icons/Diamond";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormType } from "@repo/lib/data/types";
import { useLoading } from "@repo/lib/utils/useLoading";
import { useUserStore } from "@repo/store/app/user.store";
import {
  Dimension,
  DimensionType,
  MaterialValue,
} from "@repo/store/data/types";
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
import DeleteButton from "@repo/ui/components/custom/DeleteButton";

interface SavedDieline {
  bleed: number;
  thickness: number;
  dimensionType: DimensionType;
  material: MaterialValue;
  dimension: Dimension;
  title: string;
  description?: string | undefined;
  customer?: string | undefined;
}

const SaveDielineForm = ({
  type,
  savedDieline,
}: {
  savedDieline?: SavedDieline;
  type: FormType;
}) => {
  const {
    settings: { dimension },
  } = useDielineSettingsStore();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { thickness, bleed, dimensionType, material } = getDielineSettings();
  const { isPremium } = useUserStore();

  const form = useForm<SaveDielineFormType>({
    resolver: zodResolver(saveDielineFormSchema),
    defaultValues: {
      title: savedDieline?.title ?? "",
      description: savedDieline?.description ?? "",
      customer: savedDieline?.customer ?? "",
    },
  });

  const onSubmit = (data: SaveDielineFormType) => {
    startLoading();
    const finalData: SavedDieline = {
      ...data,
      bleed,
      thickness,
      dimensionType,
      material,
      dimension: dimension.raw,
    };
    console.log(finalData);
    stopLoading();
  };

  const selectedDimensionType =
    type === "create"
      ? DIMENSIONS_TYPE.find((d) => d.key === dimensionType)
      : DIMENSIONS_TYPE.find((d) => d.key === savedDieline?.dimensionType);

  const data =
    type === "create"
      ? {
          width: dimension.raw.width,
          length: dimension.raw.length,
          height: dimension.raw.height,
          bleedSize: bleed,
          material: material.label,
          dimensionType: selectedDimensionType,
          thickness,
        }
      : {
          width: savedDieline?.dimension.width,
          length: savedDieline?.dimension.length,
          height: savedDieline?.dimension.height,
          bleedSize: savedDieline?.bleed,
          material: savedDieline?.material.label,
          dimensionType: selectedDimensionType,
          thickness: savedDieline?.thickness,
        };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <DialogTitle>
          {type === "update" ? "ویرایش قالب" : "ذخیره قالب"}
        </DialogTitle>
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
            {data.thickness}mm
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

          <div className="flex flex-col gap-3">
            <Button
              size={"lg"}
              disabled={!form.formState.isValid || isLoading || !isPremium}
              className="w-full"
            >
              ذخیره
            </Button>

            {type === "update" && <DeleteButton lang="fa" />}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SaveDielineForm;
