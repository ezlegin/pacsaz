import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ArrowLeft, ArrowRight, ArrowRightLeft } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "../shapes/PropsFormContent";
import { ISpec } from "@repo/store/types";

interface Props {
  form: UseFormReturn<ISpec.DoorSpec, any, ISpec.DoorSpec>;
}

const DoorProps = ({ form }: Props) => {
  const isBothSideDust = form.watch("dustSide") === "both";

  return (
    <PropsFormContent>
      <FormField
        control={form.control}
        name="dustSide"
        render={({ field }) => (
          <FormItem className="flex justify-between items-center">
            <FormLabel>Dust Side</FormLabel>
            <FormControl>
              <ToggleGroup
                size={"sm"}
                defaultValue={field.value}
                variant={"outline"}
                onValueChange={(val) => {
                  if (val === "") {
                    form.setValue("dustSide", undefined);
                    return;
                  }
                  field.onChange(val);
                }}
                type="single"
              >
                <ToggleGroupItem
                  className="data-[state=on]:bg-gray-200"
                  value="left"
                >
                  <ArrowLeft />
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="data-[state=on]:bg-gray-200"
                  value="both"
                >
                  <ArrowRightLeft />
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="data-[state=on]:bg-gray-200"
                  value="right"
                >
                  <ArrowRight />
                </ToggleGroupItem>
              </ToggleGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {isBothSideDust && (
        <div className="flex justify-between">
          <Label>Indent At</Label>

          <div className="flex gap-1">
            <FormField
              control={form.control}
              name="indentAt.l"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormLabel>L</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="indentAt.r"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormLabel>R</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Label>Mirror</Label>

        <div className="flex gap-1">
          <FormField
            control={form.control}
            name="mirror.x"
            render={({ field }) => (
              <FormItem className="flex">
                <FormLabel>X</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mirror.y"
            render={({ field }) => (
              <FormItem className="flex">
                <FormLabel>Y</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </PropsFormContent>
  );
};

export default DoorProps;
