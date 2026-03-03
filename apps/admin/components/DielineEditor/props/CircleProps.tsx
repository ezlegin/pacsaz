import { ISpec } from "@repo/store/editor/dielineSpec.store";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Circle } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "./PropsFormContent";

interface Props {
  form: UseFormReturn<ISpec.CircleSpec, any, ISpec.CircleSpec>;
}

const CircleProps = ({ form }: Props) => {
  const [isSemiCircle, setIsSemiCircle] = useState(
    !!form.watch("semiCircleDirection"),
  );

  const semis = [
    { key: "up", icon: Circle },
    { key: "down", icon: Circle },
    { key: "right", icon: Circle },
    { key: "left", icon: Circle },
  ];

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

      <div className="flex justify-between">
        <Label>Semi-Circle</Label>
        <Switch checked={isSemiCircle} onCheckedChange={setIsSemiCircle} />
      </div>

      {isSemiCircle && (
        <FormField
          control={form.control}
          name="semiCircleDirection"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ToggleGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  type="single"
                  spacing={0.5}
                >
                  {semis.map((item, idx) => (
                    <ToggleGroupItem
                      key={idx}
                      value={item.key}
                      className="data-[state=on]:bg-gray-200/50 data-[state=on]:border cursor-pointer group"
                    >
                      {item.key}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </PropsFormContent>
  );
};

export default CircleProps;
