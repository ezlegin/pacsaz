import { createDieline, updateDieline } from "@/actions/dieline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dieline } from "@repo/db";
import { DielineSettingsFromDB } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useLoading } from "@repo/lib/utils/useLoading";
import { bleeds } from "@repo/store/data/dieline";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Spinner } from "@repo/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import DefaultSettings from "./DefaultSettings";
import { handleRes } from "@repo/lib/utils/handleRes";

const dimension = z.object({
  width: z.number(),
  length: z.number(),
  height: z.number(),
});
const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  specification: z.string().min(1),
  variable: z.string(),
  bleed: z.number(),
  defaultDimensions: dimension,
  minDimensions: dimension,
  dimensionTypes: z.string(),
  materials: z.string(),
});

export type DielineMetadataFormType = z.infer<typeof schema>;

type DielineType = Dieline & { settings: DielineSettingsFromDB };

const DielineMetadataForm = ({ dieline }: { dieline?: DielineType }) => {
  const router = useRouter();
  const isUpdateType = !!dieline;
  const { specs } = useDielineSpecStore();
  const { variables } = useVariableStore();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const form = useForm<DielineMetadataFormType>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      title: dieline?.title || "Untitled",
      slug: dieline?.slug || "slug",
      specification: dieline?.specification ?? "",
      variable: dieline?.variable ?? "",
      bleed: dieline?.settings.bleed ?? bleeds.default,
      dimensionTypes:
        dieline?.settings.dimensionTypes ?? "manufacture,inner,outer",
      materials: dieline?.settings.materials ?? "glossyCardboard,fFlute,eFlute",
      defaultDimensions: dieline?.settings.defaultDimension ?? {
        width: 90,
        height: 50,
        length: 160,
      },
      minDimensions: dieline?.settings.minDimension ?? {
        width: 30,
        height: 30,
        length: 30,
      },
    },
    mode: "onChange",
  });

  const onSubmit = async (data: DielineMetadataFormType) => {
    startLoading();

    const res = isUpdateType
      ? await updateDieline(data, dieline!.id)
      : await createDieline(data);

    handleRes(res, {
      onSuccess: () => {
        router.push(`/editor/${data.slug}`);
      },
    });

    stopLoading();
  };

  useEffect(() => {
    form.setValue("variable", JSON.stringify(variables));
  }, [variables]);

  useEffect(() => {
    form.setValue("specification", JSON.stringify(specs));
  }, [specs]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          disabled={!form.formState.isValid || isLoading}
          className="w-full mb-3"
          variant={"primaryForeground"}
          type="submit"
        >
          <Spinner isLoading={isLoading} />
          {isUpdateType ? "Save Changes" : "Create Dieline"}
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Title"
                      className="text-lg w-full px-1 -translate-x-1 font-medium "
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Slug"
                      className="text-sm w-full px-1 text-muted-foreground -translate-x-1 "
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <DefaultSettings form={form} />
        </div>
      </form>
    </Form>
  );
};

export default DielineMetadataForm;
