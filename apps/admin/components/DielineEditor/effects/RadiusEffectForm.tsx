"use client";

import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { RadiusFormType } from "./Effects";
import { ISpec, IEffect } from "@repo/store/types";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addEffect, effectsSelectors } from "@repo/store/slices/effectsSlice";
import { nanoid } from "nanoid";

const RadiusEffectForm = ({
  closeForm,
  shapes,
  form,
}: {
  form: UseFormReturn<RadiusFormType, any, RadiusFormType>;
  closeForm: () => void;
  shapes: ISpec.Shapes;
}) => {
  const [effectOn, setEffectOn] = useState<IEffect.EffectOn>("shape");
  const dispatch = useAppDispatch();
  const effects = useAppSelector(effectsSelectors.selectAll);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const onSubmit = async (data: RadiusFormType) => {
    startLoading();

    dispatch(
      addEffect({
        key: data.key,
        type: "radius",
        effectOn,
        radius: +data.radius,
        targetModelId: data.targetModelId,
        hidden: false,
        id: nanoid(),
      }),
    );

    toast.success("Effect Applied.");
    closeForm();

    stopLoading();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Input {...field} className="h-9" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="radius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Radius</FormLabel>
              <FormControl>
                <Input {...field} className="h-9" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetModelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-between">
                <span>Target</span>
                <ToggleGroup
                  onValueChange={(val) => {
                    setEffectOn(val as IEffect.EffectOn);
                  }}
                  size={"xs"}
                  type="single"
                  defaultValue={effectOn}
                >
                  <ToggleGroupItem
                    className="data-[state=on]:bg-muted-foreground/20 text-xs"
                    value="shape"
                  >
                    Shape
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    className="data-[state=on]:bg-muted-foreground/20 text-xs"
                    value="effect"
                  >
                    Effect
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormLabel>
              <ToggleGroup
                size={"xs"}
                spacing={1}
                variant={"outline"}
                type="single"
                className="flex-col items-start"
                onValueChange={(val) => {
                  console.log(val);
                  field.onChange(val);
                }}
              >
                {(effectOn === "shape" ? shapes : effects).map((item, idx) => (
                  <ToggleGroupItem
                    className="data-[state=on]:bg-muted-foreground/20"
                    key={idx}
                    value={item.id}
                  >
                    {item.key}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Button
            size={"sm"}
            disabled={isLoading}
            className="w-full"
            variant={"outline"}
          >
            <Spinner isLoading={isLoading} />
            Apply Effect
          </Button>

          <Button
            size={"sm"}
            variant={"outline"}
            className="w-full"
            onClick={() => closeForm()}
          >
            Close
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RadiusEffectForm;
