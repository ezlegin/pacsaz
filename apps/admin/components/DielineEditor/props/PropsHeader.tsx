import { Button } from "@repo/ui/components/button";
import { FormField, FormItem, FormControl } from "@repo/ui/components/form";
import { ChevronLeft, Check } from "lucide-react";
import React from "react";

const PropsHeader = ({ form, close }: { form: any; close: () => void }) => {
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            type="button"
            className="has-[>svg]:px-0 "
            onClick={close}
          >
            <ChevronLeft />
          </Button>
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Shape Name"
                    className="p-0 h-fit w-fit border-0 bg-transparent text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus:font-medium focus:border-b"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          variant="primaryForeground"
          size="icon"
          type="submit"
          disabled={!form.formState.isValid}
        >
          <Check />
        </Button>
      </div>
    </div>
  );
};

export default PropsHeader;
