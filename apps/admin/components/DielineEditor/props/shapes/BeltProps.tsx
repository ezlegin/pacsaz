import { ISpec } from "@repo/store/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "./PropsFormContent";

interface Props {
  form: UseFormReturn<ISpec.BeltSpec, any, ISpec.BeltSpec>;
}

const BeltProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name="rightRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Top Radius</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="expr.."
                  className="h-9"
                  list="suggestion"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leftRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>bottom Radius</FormLabel>
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
      </div>

      <FormField
        control={form.control}
        name="distance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distance Between Centres</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="expr.."
                className="h-9"
                list="suggestion"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="angle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rotation (°)</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? "90"}
                placeholder="90"
                className="h-9"
                list="suggestion"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              90 is vertical, 0 is horizontal.
            </p>
          </FormItem>
        )}
      />
    </PropsFormContent>
  );
};

export default BeltProps;
