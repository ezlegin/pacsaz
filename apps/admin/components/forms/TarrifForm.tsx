"use client";

import { createAndUpdateTarrif } from "@/actions/tarrif";
import { handleRes } from "@/lib/utils/handleRes";
import {
  tarrifFormSchema,
  TarrifFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tarrif } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
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
import SubmitButton from "../SubmitButton";

function TarrifForm({ tarrif }: { tarrif: Tarrif[] }) {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const tarrifs = {
    title: "",
    description: "",
    shortDescription: "",
    fairDownload: "10",
    monthly: "299000",
    threeMonth: "299000",
    annual: "299000",
  };

  const defaults = {
    standard: tarrifs,
    organization: tarrifs,
    pro: tarrifs,
  };

  const mappedTarrif = tarrif?.reduce(
    (acc, item) => ({ ...acc, [item.key]: item }),
    {},
  );

  const form = useForm<TarrifFormType>({
    resolver: zodResolver(tarrifFormSchema),
    defaultValues: tarrif.length > 0 ? mappedTarrif : defaults,
  });

  const onSubmit = async (data: TarrifFormType) => {
    startLoading();

    const res = await createAndUpdateTarrif(data);

    handleRes(res, { onSuccess: () => router.refresh() });

    stopLoading();
  };

  const keys = [
    "title",
    "description",
    "shortDescription",
    "fairDownload",
    "monthly",
    "threeMonth",
    "annual",
  ];
  const inputs = {
    standard: keys,
    pro: keys,
    organization: keys,
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-3 gap-15">
          {Object.entries(inputs).map(([key, value]) => (
            <div key={key} className="space-y-4">
              <span className="text-primary font-medium text-lg capitalize">
                {key}
              </span>
              {value.map((plan, idx) => (
                <FieldInput
                  key={idx}
                  form={form}
                  label={plan}
                  name={`${key}.${plan}`}
                />
              ))}
            </div>
          ))}
        </div>

        <SubmitButton
          form={form}
          isLoading={isLoading}
          label="Save Tarrif"
          className="w-fit"
        />
      </form>
    </Form>
  );
}

export default TarrifForm;

const FieldInput = ({
  form,
  name,
  label,
}: {
  name: string;
  label: string;
  form: any;
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
