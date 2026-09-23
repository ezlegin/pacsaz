import { ISpec } from "@repo/store/types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "../shapes/PropsFormContent";

interface Props {
  form: UseFormReturn<ISpec.HoleSpec, any, ISpec.HoleSpec>;
}

const HoleProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <FormField
        control={form.control}
        name="angleBetweenStartAndEnd"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Angle Between</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="expr.."
                autoFocus
                className="h-9"
                list="suggestion"
              />
            </FormControl>
            <FormDescription className="text-xs">{`0° >= Angle < 90°`}</FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="heightOfLine"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Line Height</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="expr.."
                autoFocus
                className="h-9"
                list="suggestion"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rotation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rotation (°)</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="expr.."
                autoFocus
                className="h-9"
                list="suggestion"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="handleDir"
        render={({ field }) => (
          <FormItem className="flex justify-between items-center">
            <FormLabel>Handle Direction</FormLabel>
            <FormControl>
              <ToggleGroup
                size={"sm"}
                defaultValue={field.value}
                variant={"outline"}
                onValueChange={(val) => {
                  if (val === "") {
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

export default HoleProps;
