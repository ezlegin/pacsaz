import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { FormControl, FormField, FormItem } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Minus, Plus } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import PropsFormContent from "./PropsFormContent";
import { Switch } from "@repo/ui/components/switch";

interface Props {
  form: UseFormReturn<ISpec.LinesSpec, any, ISpec.LinesSpec>;
}

const LinesProps = ({ form }: Props) => {
  const { append, remove, fields } = useFieldArray({
    control: form.control,
    name: "pts",
  });

  return (
    <PropsFormContent>
      <div className="flex justify-between items-center">
        <Label>Points</Label>

        <FormField
          control={form.control}
          name={`isRelative`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-1">
                  <Label>Rel</Label>
                  <Switch
                    checked={form.getValues("isRelative")}
                    onCheckedChange={field.onChange}
                  />
                  <Label>Abs</Label>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      {fields.map((field, idx) => (
        <div key={field.id} className="flex mb-2">
          <FormField
            control={form.control}
            name={`pts.${idx}.0`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center">
                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      className="size-2 p-4 pl-0.5 py-4 group"
                      onClick={() => remove(idx)}
                    >
                      <div className="hidden group-hover:block">
                        <Minus />
                      </div>
                      <div className="text-muted-foreground text-xs group-hover:hidden">
                        P{idx + 1}
                      </div>
                    </Button>
                    <Input
                      {...field}
                      placeholder="expr.."
                      autoFocus={idx === 0}
                      className="h-9 rounded-r-none"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            key={field.id}
            control={form.control}
            name={`pts.${idx}.1`}
            render={({ field }) => (
              <FormItem
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") append([["", ""]]);
                }}
              >
                <FormControl>
                  <Input
                    {...field}
                    placeholder="expr.."
                    className="h-9 rounded-l-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ))}
      <div className="flex justify-end">
        <Button
          size={"icon"}
          variant={"outline"}
          className="size-7"
          onClick={() => append([["", ""]])}
        >
          <Plus />
        </Button>
      </div>
    </PropsFormContent>
  );
};

export default LinesProps;
