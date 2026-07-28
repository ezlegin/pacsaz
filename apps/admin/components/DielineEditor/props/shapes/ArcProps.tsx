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
  form: UseFormReturn<ISpec.ArcSpec, any, ISpec.ArcSpec>;
}

const ArcProps = ({ form }: Props) => {
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
      <div className="flex gap-3">
        <FormField
          control={form.control}
          name="startAngle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start (°)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="expr.." className="h-9" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endAngle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End (°)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="expr.." className="h-9" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </PropsFormContent>
  );
};

export default ArcProps;
