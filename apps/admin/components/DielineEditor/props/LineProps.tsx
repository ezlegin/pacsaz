import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "./PropsFormContent";
import { ISpec } from "@repo/store/dieline/dielineSpec.store";

interface Props {
  form: UseFormReturn<ISpec.LineSpec, any, ISpec.LineSpec>;
}

const LineProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <FormField
        control={form.control}
        name="length"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Length</FormLabel>
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
        name="angle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Angle</FormLabel>
            <FormControl>
              <Input {...field} placeholder="0" className="h-9" />
            </FormControl>
          </FormItem>
        )}
      />
    </PropsFormContent>
  );
};

export default LineProps;
