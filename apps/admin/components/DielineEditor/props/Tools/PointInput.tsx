import { FormField, FormItem, FormControl } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import React from "react";
import { UseFormReturn } from "react-hook-form";

const PointInput = ({
  form,
  nameX,
  nameY,
  label,
}: {
  nameX: string;
  nameY: string;
  label?: string;
  form: UseFormReturn<any, any, any>;
}) => {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <div className="flex">
        <FormField
          control={form.control}
          name={nameX}
          render={({ field }) => (
            <FormItem className="gap-0 relative">
              <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                X
              </span>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0"
                  className="h-9 pl-7 rounded-r-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={nameY}
          render={({ field }) => (
            <FormItem className="gap-0 relative">
              <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                Y
              </span>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0"
                  className="h-9 pl-7 rounded-l-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PointInput;
