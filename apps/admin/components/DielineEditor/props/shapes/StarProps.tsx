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
  form: UseFormReturn<ISpec.StarSpec, any, ISpec.StarSpec>;
}

const StarProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <FormField
        control={form.control}
        name="points"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Points</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="5"
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
        name="radius"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Outer Radius</FormLabel>
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
        name="innerRadius"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inner Radius</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="auto"
                className="h-9"
                list="suggestion"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Leave empty to derive it from the point count.
            </p>
          </FormItem>
        )}
      />
    </PropsFormContent>
  );
};

export default StarProps;
