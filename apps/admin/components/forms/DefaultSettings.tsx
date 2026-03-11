import { materials } from "@repo/store/data/dieline";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Settings } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { DielineMetadataFormType } from "./DielineMetadataForm";
type Form = UseFormReturn<
  DielineMetadataFormType,
  any,
  DielineMetadataFormType
>;

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

export default DefaultSettings;

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
