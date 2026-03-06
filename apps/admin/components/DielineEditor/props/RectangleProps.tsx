import { ISpec } from "@repo/store/editor/dielineSpec.store";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "./PropsFormContent";

interface Props {
  form: UseFormReturn<ISpec.RectangleSpec, any, ISpec.RectangleSpec>;
}

const RectangleProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <FormField
        control={form.control}
        name="width"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Width</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="expr.."
                autoFocus
                className="h-9"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Height</FormLabel>
            <FormControl>
              <Input {...field} placeholder="expr.." className="h-9" />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="radius"
        render={({ field }) => (
          <FormItem className="flex justify-between">
            <FormLabel>Radius</FormLabel>
            <FormControl>
              <Input {...field} placeholder="12 px" className="h-9" />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deleteSide"
        render={({ field }) => (
          <FormItem className="flex justify-between items-center">
            <FormLabel>Delete Side</FormLabel>
            <FormControl>
              <ToggleGroup
                size={"sm"}
                defaultValue={field.value}
                variant={"outline"}
                onValueChange={(val) => {
                  if (val === "") {
                    form.setValue("deleteSide", undefined);
                    return;
                  }
                  field.onChange(val);
                }}
                type="single"
              >
                <ToggleGroupItem
                  className="data-[state=on]:bg-gray-200"
                  value="up"
                >
                  <ArrowUp />
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="data-[state=on]:bg-gray-200"
                  value="down"
                >
                  <ArrowDown />
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="data-[state=on]:bg-gray-200"
                  value="left"
                >
                  <ArrowLeft />
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
    </PropsFormContent>
  );
};

export default RectangleProps;
