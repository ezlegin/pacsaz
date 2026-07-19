"use client";

import {
  createDieline,
  deleteDielineImage,
  deleteModelImage,
  updateDieline,
} from "@/actions/dieline";
import { Categories, DielineType } from "@/app/(PANEL)/dielines/DielinesList";
import {
  dielineMetadataFormSchema,
  DielineMetadataFormType,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleRes } from "@repo/lib/utils/handleRes";
import { useLoading } from "@repo/lib/utils/useLoading";
import { materials } from "@repo/store/data/dieline";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
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
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ImageField from "../ImageField";

const DielineSettingsForm = ({
  categories,
  dieline,
}: {
  categories: Categories;
  dieline?: DielineType;
}) => {
  const settings = dieline?.settings;
  const router = useRouter();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const form = useForm<DielineMetadataFormType>({
    resolver: zodResolver(dielineMetadataFormSchema),
    defaultValues: {
      bleed: settings?.bleed ?? 5,
      defaultDimensions: {
        width: settings?.width ?? 90,
        height: settings?.height ?? 50,
        length: settings?.length ?? 160,
      },
      minDimensions: {
        width: dieline?.minWidth ?? 30,
        height: dieline?.minHeight ?? 30,
        length: dieline?.minLength ?? 30,
      },
      title: dieline?.title ?? "",
      slug: dieline?.slug ?? "",
      dimensionTypes: dieline?.dimensionTypes ?? "manufacture,inner,outer",
      materials: dieline?.materials ?? "fFlute,glossyCardboard,eFlute,artPaper",
      defaultMaterial: dieline?.defaultMaterial ?? "glossyCardboard",
      categoryByModel:
        dieline && dieline.categoryByModel.length > 0
          ? dieline.categoryByModel.map((i) => i.slug)
          : [],
      categoryByUsage:
        dieline && dieline.categoryByUsage.length > 0
          ? dieline.categoryByUsage.map((i) => i.slug)
          : [],
    },
    mode: "onChange",
  });

  const onSubmit = async (data: DielineMetadataFormType) => {
    startLoading();
    const res = dieline
      ? await updateDieline(data, dieline.id)
      : await createDieline(data);

    handleRes(res, {
      onSuccess: () => {
        if (!dieline) router.push(`/editor/${res.slug}`);
        else router.refresh();
      },
    });
    stopLoading();
  };

  const selectedMaterials = form.watch("materials").split(",");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-5"
      >
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Untitled" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="slug" />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <div className="space-y-1">
              <Label>Dieline Image</Label>
              <ImageField
                control={form.control}
                setValue={form.setValue}
                public_id={dieline?.dielineImage?.publicId}
                image={dieline?.dielineImage?.url}
                formFieldName="dielineImage"
                deleteImageFn={deleteDielineImage}
              />
            </div>

            <div className="space-y-1">
              <Label>Model Image</Label>
              <ImageField
                control={form.control}
                setValue={form.setValue}
                public_id={dieline?.modelImage?.publicId}
                image={dieline?.modelImage?.url}
                formFieldName="modelImage"
                deleteImageFn={deleteModelImage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categories By Model</Label>
            <FormField
              control={form.control}
              name="categoryByModel"
              render={({ field }) => (
                <div className="grid grid-cols-2">
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
          </div>

          <div className="space-y-2">
            <Label>Categories By Usage</Label>
            <FormField
              control={form.control}
              name="categoryByUsage"
              render={({ field }) => (
                <div className="grid grid-cols-2">
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

        <div className="space-y-5">
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
                  {materials.map((item, idx) => {
                    const isChecked = field.value
                      ?.split(",")
                      .includes(item.value);
                    return (
                      <FormItem
                        key={idx}
                        className="flex flex-row items-center gap-3 pb-1.5"
                      >
                        <FormControl>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const materials = field.value.split(",");
                              const updatedMaterials = checked
                                ? [...materials, item.value].join(",")
                                : materials
                                    .filter((i) => i !== item.value)
                                    .join(",");

                              field.onChange(updatedMaterials);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {item.value}
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

          <FormField
            control={form.control}
            name="defaultMaterial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Material</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Bleed Amount" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {selectedMaterials.map((mat, idx) => (
                        <SelectItem value={mat} key={idx}>
                          {mat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            className="w-full"
            disabled={!form.formState.isValid || isLoading}
          >
            {dieline ? "Update" : "Create New"} Dieline
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DielineSettingsForm;

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
