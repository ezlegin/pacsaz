import { createDieline, updateDieline } from "@/actions/dieline";
import { handleRes } from "@/lib/utils/handleRes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dieline } from "@repo/db";
import { DielineSettingsFromDB } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useLoading } from "@repo/lib/utils/useLoading";
import { bleeds, materials } from "@repo/store/data/dieline";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Spinner } from "@repo/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import z from "zod";

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
      materials:
        dieline?.settings.materials ?? "glossy-cardboard,f-flute,e-flute",
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
        router.push(`/dielines/${data.slug}`);
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

type Form = UseFormReturn<
  DielineMetadataFormType,
  any,
  DielineMetadataFormType
>;

export default DielineMetadataForm;

const DefaultSettings = ({ form }: { form: Form }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Settings
          size={18}
          className="text-muted-foreground cursor-pointer hover:text-primary"
        />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        overlayClassname="backdrop-blur-xs bg-transparent"
      >
        <DialogTitle className="sr-only" />

        <FormField
          control={form.control}
          name="bleed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bleed</FormLabel>
              <FormControl>
                <Select
                  defaultValue={String(field.value)}
                  onValueChange={(val) => {
                    field.onChange(+val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bleed Amount" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <Label>Default Dimensions</Label>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="defaultDimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput field={field} placeHolder="Width" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultDimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput field={field} placeHolder="Length" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultDimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput field={field} placeHolder="Height" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Min Dimensions</Label>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="minDimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput field={field} placeHolder="Width" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minDimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput field={field} placeHolder="Length" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minDimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput field={field} placeHolder="Height" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="dimensionTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dimension Types</FormLabel>
              <FormControl>
                <ToggleGroup
                  variant={"outline"}
                  defaultValue={field.value.split(",")}
                  type="multiple"
                  onValueChange={(val) => {
                    if (val.length === 0) return;

                    const stringVal = val.join(",");
                    field.onChange(stringVal);
                  }}
                >
                  <ToggleGroupItem value="manufacture">
                    Manufacture
                  </ToggleGroupItem>
                  <ToggleGroupItem value="inner">Inner</ToggleGroupItem>
                  <ToggleGroupItem value="outer">Outer</ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <Label>Materials</Label>
          <FormField
            control={form.control}
            name="materials"
            render={({ field }) => (
              <div className="grid grid-cols-2">
                {Object.entries(materials)?.map(([key, item]) => {
                  const isChecked = field.value
                    ?.split(",")
                    .includes(item.value);
                  return (
                    <FormItem
                      key={key}
                      className="flex flex-row items-center gap-3 pb-1.5"
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const materials = field.value.split(",");
                            const updatedMaterials = checked
                              ? [...materials, key].join(",")
                              : materials.filter((i) => i !== key).join(",");

                            field.onChange(updatedMaterials);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {key}
                        <span className="text-xs text-muted-foreground">
                          ({item.thickness}mm)
                        </span>
                      </FormLabel>
                    </FormItem>
                  );
                })}
              </div>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NumberInput = ({
  field,
  placeHolder,
}: {
  field: any;
  placeHolder?: string;
}) => {
  return (
    <Input
      type="number"
      {...field}
      placeholder={placeHolder}
      onChange={(e) => {
        const value = e.target.value;
        field.onChange(value === "" ? 0 : Number(value));
      }}
    />
  );
};
