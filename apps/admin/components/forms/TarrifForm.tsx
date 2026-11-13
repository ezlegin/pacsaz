"use client";

import {
  tarrifFormSchema,
  TarrifFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FairDownload,
  PlanKey,
  Price,
  SelectedTarrifFeature,
  Tarrif,
  TarrifFeature,
} from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SubmitButton from "../SubmitButton";
import { handleRes } from "@repo/lib/utils/handleRes";
import { createTarrif, updateTarrif } from "@/actions/tarrif";

export interface TarrifType extends Tarrif {
  price: Price | null;
  fairDownload: FairDownload | null;
  features: SelectedTarrifFeature[];
}

export function TarrifForm({
  tarrif,
  features,
  plans = [],
}: {
  tarrif?: TarrifType;
  features: TarrifFeature[];
  /** Every saved plan, to find the one this plan builds on. */
  plans?: TarrifType[];
}) {
  const router = useRouter();

  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<TarrifFormType>({
    resolver: zodResolver(tarrifFormSchema),
    defaultValues: {
      title: tarrif?.title ?? "",
      description: tarrif?.description ?? "",
      shortDescription: tarrif?.shortDescription ?? "",
      discountAmount: tarrif?.discountAmount.toString() ?? "0",
      price: {
        monthly: tarrif?.price?.monthly.toString() ?? "",
        threeMonth: tarrif?.price?.threeMonth.toString() ?? "",
        annual: tarrif?.price?.annual.toString() ?? "",
      },
      fairDownload: {
        monthly: tarrif?.fairDownload?.monthly.toString() ?? "",
        threeMonth: tarrif?.fairDownload?.threeMonth.toString() ?? "",
        annual: tarrif?.fairDownload?.annual.toString() ?? "",
      },
      isRecommended: tarrif?.isRecommended ?? false,
      key: tarrif?.key ?? "standard",
      selectedFeatures:
        tarrif?.features.map((f) => f.tarrifFeatureId.toString()) ?? [],
    },
  });

  /**
   * The pricing cards read "everything in <plan below>, plus:" and list only
   * what this plan adds, so the form shows which features already come from
   * the plan below (the saved plan with the next lower key).
   */
  const key = form.watch("key");
  const selected = form.watch("selectedFeatures");
  const below = plans
    .filter((p) => p.id !== tarrif?.id && levelOf[p.key] < levelOf[key])
    .sort((a, b) => b.level - a.level)[0];
  const inherited = new Set(below?.features.map((f) => f.tarrifFeatureId) ?? []);
  const added = features.filter(
    (f) => selected.includes(f.id.toString()) && !inherited.has(f.id),
  );
  const missing = features.filter(
    (f) => inherited.has(f.id) && !selected.includes(f.id.toString()),
  );

  const onSubmit = async (data: TarrifFormType) => {
    startLoading();

    const res = tarrif
      ? await updateTarrif(data, tarrif.id)
      : await createTarrif(data);

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
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
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} dir="rtl" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-1.5">
          <Label>Fair Download</Label>
          <div className="flex gap-3 justify-between">
            <TextInput
              formControl={form.control}
              name="fairDownload.monthly"
              placeHolder="Monthly"
            />
            <TextInput
              formControl={form.control}
              name="fairDownload.threeMonth"
              placeHolder="Three-Month"
            />
            <TextInput
              formControl={form.control}
              name="fairDownload.annual"
              placeHolder="Annual"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Price</Label>
          <div className="flex gap-3 justify-between">
            <TextInput
              formControl={form.control}
              name="price.monthly"
              placeHolder="Monthly"
            />
            <TextInput
              formControl={form.control}
              name="price.threeMonth"
              placeHolder="Three-Month"
            />
            <TextInput
              formControl={form.control}
              name="price.annual"
              placeHolder="Annual"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="discountAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Amount (%)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-between  gap-3">
          <FormField
            control={form.control}
            name="key"
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
                      {tarrifKeys.map((i, idx) => (
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

          <FormField
            control={form.control}
            name="isRecommended"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Recommended</FormLabel>
                <FormControl>
                  <Switch
                    defaultChecked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>Features</Label>
          <p className="text-xs text-muted-foreground">
            {below
              ? `Builds on "${below.title}". The card shows "everything in ${below.title}, plus:" and lists only the features ${below.title} does not have.`
              : "Entry plan: the card lists every feature ticked here."}
          </p>
          <FormField
            control={form.control}
            name="selectedFeatures"
            render={({ field }) => (
              <div className="max-h-56 overflow-y-auto rounded-md border p-2">
                {features.map((item, idx) => {
                  const isChecked = field.value.includes(item.id.toString());

                  return (
                    <FormItem
                      key={idx}
                      className="flex flex-row items-center gap-3 pb-1.5"
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const updatedFeatures = checked
                              ? [...field.value, item.id.toString()]
                              : field.value.filter(
                                  (i) => i !== item.id.toString(),
                                );

                            field.onChange(updatedFeatures);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {item.title}
                        {below && inherited.has(item.id) && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            in {below.title}
                          </span>
                        )}
                      </FormLabel>
                    </FormItem>
                  );
                })}
              </div>
            )}
          />
        </div>

        {below && (
          <div className="space-y-1.5 rounded-md bg-muted/50 p-3 text-xs" dir="rtl">
            <p className="font-semibold">
              همه ویژگی‌های پلن {below.title}، به علاوه:
            </p>
            {added.length ? (
              <ul className="list-disc space-y-0.5 pr-4">
                {added.map((f) => (
                  <li key={f.id}>{f.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground" dir="ltr">
                Nothing added yet: tick features {below.title} does not have.
              </p>
            )}
            {missing.length > 0 && (
              <p className="text-amber-600" dir="ltr">
                Not ticked but in {below.title}: {missing.map((f) => f.title).join(", ")}.
                The card would still claim them through &quot;everything in {below.title}&quot;.
              </p>
            )}
          </div>
        )}

        <SubmitButton
          form={form}
          isLoading={isLoading}
          label={tarrif ? "Update" : "Create"}
        />
      </form>
    </Form>
  );
}

const tarrifKeys: PlanKey[] = ["standard", "pro", "organization"];

/** Same order as `levels` in `actions/tarrif.ts`. */
const levelOf: Record<PlanKey, number> = { standard: 1, pro: 2, organization: 3 };

const TextInput = ({
  formControl,
  name,
  placeHolder,
}: {
  formControl: any;
  name: string;
  placeHolder?: string;
}) => {
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} placeholder={placeHolder} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
