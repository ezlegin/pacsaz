"use client";

import {
  createSaveDieline,
  Settings,
  updateSavedDieline,
} from "@/actions/dieline";
import { handleRes } from "@/lib/handleRes";
import {
  saveDielineFormSchema,
  SaveDielineFormType,
} from "@/lib/validatoinSchema";
import Diamond from "@/public/icons/Diamond";
import { zodResolver } from "@hookform/resolvers/zod";
import { SavedDieline } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { useUserStore } from "@repo/store/app/user.store";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const SaveDielineForm = ({
  settings,
  savedDieline,
  slug,
}: {
  slug: string;
  savedDieline?: SavedDieline;
  settings: Settings;
}) => {
  const router = useRouter();
  const isUpdateType = !!savedDieline;
  const { bleed, dimensionType, height, length, material, thickness, width } =
    settings;
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { isPremium } = useUserStore();

  const form = useForm<SaveDielineFormType>({
    resolver: zodResolver(saveDielineFormSchema),
    defaultValues: {
      title: savedDieline?.title ?? "",
      description: savedDieline?.description ?? "",
      bleed,
      height,
      length,
      material,
      thickness,
      width,
      dimensionType,
    },
  });

  const onSubmit = async (data: SaveDielineFormType) => {
    startLoading();
    isUpdateType;
    const res = isUpdateType
      ? await updateSavedDieline(data, savedDieline.id)
      : await createSaveDieline(data, slug);

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  return (
    <div className="space-y-5">
      {!isPremium && (
        <Badge variant={"lightRed"} className="p-2 px-4">
          <Diamond />
          فقط در اشتراک حرفه ای و سازمانی
        </Badge>
      )}

      <ul className="text-sm text-muted-foreground space-y-2 border p-3 rounded-md px-0">
        <div className="flex justify-between px-3">
          <li>عرض: {width}mm</li>
          <li>طول: {length}mm</li>
          <li>ارتفاع: {height}mm</li>
          <li>نوع ابعاد: {dimensionType}</li>
        </div>

        <Separator />

        <div className="flex justify-between px-3">
          <li>بلید: {bleed}mm</li>
          <li>متریال: {material}</li>
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

          {/* <FormField
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
          /> */}

          <div className="flex flex-col gap-3">
            <Button
              size={"lg"}
              disabled={!form.formState.isValid || isLoading || !isPremium}
              className="w-full"
            >
              ذخیره
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SaveDielineForm;
