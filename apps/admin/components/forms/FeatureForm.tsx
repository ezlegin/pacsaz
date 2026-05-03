"use client";

import { updateFeature, createFeature } from "@/actions/feature";
import {
  FeatureFormType,
  featureFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TarrifFeature, TarrifFeatureType } from "@repo/db";
import { handleRes } from "@repo/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

function FeatureForm({ feature }: { feature?: TarrifFeature }) {
  const router = useRouter();

  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<FeatureFormType>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: {
      title: feature?.title ?? "",
      type: feature?.type ?? "general",
    },
  });

  const onSubmit = async (data: FeatureFormType) => {
    startLoading();

    const res = feature
      ? await updateFeature(data, feature.id)
      : await createFeature(data);

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  const types: TarrifFeatureType[] = ["general", "paid"];

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
          name="type"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((i, idx) => (
                      <SelectItem key={idx} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          form={form}
          isLoading={isLoading}
          label={feature ? "Update" : "Create"}
        />
      </form>
    </Form>
  );
}

export default FeatureForm;
