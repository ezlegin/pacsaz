import { ISpec } from "@repo/store/types";
import { Button } from "@repo/ui/components/button";
import { FormControl, FormField, FormItem } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import PropsFormContent from "./PropsFormContent";
import PointInput from "./PointInput";

interface Props {
  form: UseFormReturn<ISpec.LinesSpec, any, ISpec.LinesSpec>;
}

const LinesProps = ({ form }: Props) => {
  const isRelative = form.watch("isRelative");
  const [applyRadius, setApplyRadius] = useState(!!form.watch("filletRadius"));

  useEffect(() => {
    form.setValue(isRelative ? "absolutePts" : "relativePts", undefined);
  }, [isRelative]);

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
                  <Label>Abs</Label>
                  <Switch
                    checked={form.getValues("isRelative")}
                    onCheckedChange={field.onChange}
                  />
                  <Label>Rel</Label>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      {isRelative ? <RelPts form={form} /> : <AbsPts form={form} />}

      <Separator />

      <FormField
        control={form.control}
        name={`isClosed`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex justify-between">
                <Label>Closed</Label>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-1">
        <div className="flex justify-between">
          <Label>Radius</Label>
          <Switch checked={applyRadius} onCheckedChange={setApplyRadius} />
        </div>
        {applyRadius && (
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name={`filletRadius`}
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                      Amount
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        autoCapitalize="characters"
                        placeholder="0"
                        className="h-9 pl-16"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`indices`}
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                      Indices
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0,1,2"
                        className="h-9 pl-16"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </PropsFormContent>
  );
};

export default LinesProps;

const AbsPts = ({ form }: Props) => {
  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "absolutePts",
  });

  return (
    <div>
      {fields.map((field, idx) => (
        <div key={field.id} className="flex mb-2">
          <FormField
            control={form.control}
            name={`absolutePts.${idx}.0`}
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
            control={form.control}
            name={`absolutePts.${idx}.1`}
            render={({ field }) => (
              <FormItem
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") append([["0", "0"]]);
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
          type="button"
          onClick={() => append([["0", "0"]])}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

const RelPts = ({ form }: Props) => {
  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "relativePts.pts",
  });
  const ptDir = form.watch("relativePts.pts");

  return (
    <div className="space-y-4">
      {fields.map((field, idx) => (
        <div key={field.id} className="flex mb-2">
          <FormField
            control={form.control}
            name={`relativePts.pts.${idx}.0`}
            render={({ field }) => (
              <FormItem
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter")
                    append([["0", "0", "right"]]);
                }}
                className={cn(ptDir && ptDir[idx]?.[2] !== "draw" && "w-full")}
              >
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

          {ptDir && ptDir[idx]?.[2] === "draw" && (
            <FormField
              control={form.control}
              name={`relativePts.pts.${idx}.1`}
              render={({ field }) => (
                <FormItem
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter")
                      append([["0", "0", "right"]]);
                  }}
                >
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="expr.."
                      className="h-9 rounded-l-none rounded-r-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            key={field.id}
            control={form.control}
            name={`relativePts.pts.${idx}.2`}
            render={({ field }) => (
              <FormItem>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger showIcon={false} className="rounded-l-none">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-min min-w-0">
                    <SelectItem value="up" className="min-w-0">
                      <ArrowUp />
                    </SelectItem>
                    <SelectItem value="right" className="min-w-0">
                      <ArrowRight />
                    </SelectItem>
                    <SelectItem value="left" className="min-w-0">
                      <ArrowLeft />
                    </SelectItem>
                    <SelectItem value="down" className="min-w-0">
                      <ArrowDown />
                    </SelectItem>
                    <SelectItem value="draw" className="min-w-0">
                      <ArrowUpDown className="rotate-45" />
                    </SelectItem>
                  </SelectContent>
                </Select>
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
          type="button"
          onClick={() => append([["0", "0", "right"]])}
        >
          <Plus />
        </Button>
      </div>

      <PointInput
        label="Start"
        form={form}
        nameX="relativePts.startPt.0"
        nameY="relativePts.startPt.1"
      />
    </div>
  );
};
