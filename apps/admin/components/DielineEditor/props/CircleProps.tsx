import { CircleSpec } from "@repo/store/dieline/dielineSpec.store";
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
  form: UseFormReturn<CircleSpec, any, CircleSpec>;
}

const CircleProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <FormField
        control={form.control}
        name="radius"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Radius</FormLabel>
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
    </PropsFormContent>
  );
};

export default CircleProps;
