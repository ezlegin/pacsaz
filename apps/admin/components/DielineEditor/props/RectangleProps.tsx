import { RectangleSpec } from "@repo/store/dieline/dielineSpec.store";
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
  form: UseFormReturn<RectangleSpec, any, RectangleSpec>;
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
    </PropsFormContent>
  );
};

export default RectangleProps;
