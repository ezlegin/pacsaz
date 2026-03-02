import { ISpec } from "@repo/store/editor/dielineSpec.store";
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
  form: UseFormReturn<ISpec.PolygonSpec, any, ISpec.PolygonSpec>;
}

const PolygonProps = ({ form }: Props) => {
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
      <FormField
        control={form.control}
        name="sides"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sides</FormLabel>
            <FormControl>
              <Input {...field} placeholder="5" className="h-9" />
            </FormControl>
          </FormItem>
        )}
      />
    </PropsFormContent>
  );
};

export default PolygonProps;
