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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Spinner } from "@repo/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { BooleanFormType } from "./Effects";
import { ISpec, IEffect } from "@repo/store/types";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addEffect, effectsSelectors } from "@repo/store/slices/effectsSlice";
import { nanoid } from "nanoid";

const BooleanEffectForm = ({
  closeForm,
  shapes,
  form,
}: {
  form: UseFormReturn<BooleanFormType, any, BooleanFormType>;
  closeForm: () => void;
  shapes: ISpec.Shapes;
}) => {
  const [originEffectOn, setOriginEffectOn] =
    useState<IEffect.EffectOn>("shape");
  const [targetEffectOn, setTargetEffectOn] =
    useState<IEffect.EffectOn>("shape");
  const effects = useAppSelector(effectsSelectors.selectAll);
  const dispatch = useAppDispatch();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const onSubmit = async (data: BooleanFormType) => {
    startLoading();

    dispatch(
      addEffect({
        key: data.key,
        booleanType: data.booleanType,
        type: "boolean",
        effectOn: originEffectOn,
        originModelId: data.originModelId,
        targetModelId: data.targetModelId,
        hidden: false,
        id: nanoid(),
      }),
    );

    toast.success("Effect Applied.");
    closeForm();

    stopLoading();
  };

  const booleanTypes: { key: IEffect.BooleanType }[] = [
    { key: "union" },
    { key: "subtract" },
    { key: "intersect" },
  ];

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
          name="booleanType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Boolean Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {booleanTypes.map(({ key }) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="originModelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="justify-between">
                <span>Origin</span>
                <ToggleGroup
                  onValueChange={(val) => {
                    setOriginEffectOn(val as IEffect.EffectOn);
                  }}
                  size={"xs"}
                  type="single"
                  defaultValue={originEffectOn}
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
                onValueChange={(val) => field.onChange(val)}
              >
                {(originEffectOn === "shape" ? shapes : effects).map(
                  (shape, idx) => (
                    <ToggleGroupItem
                      className="data-[state=on]:bg-muted-foreground/20"
                      key={idx}
                      value={shape.id}
                    >
                      {shape.key}
                    </ToggleGroupItem>
                  ),
                )}
              </ToggleGroup>
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
                    setTargetEffectOn(val as IEffect.EffectOn);
                  }}
                  size={"xs"}
                  type="single"
                  defaultValue={originEffectOn}
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
                onValueChange={(val) => field.onChange(val)}
              >
                {(targetEffectOn === "shape" ? shapes : effects).map(
                  (shape, idx) => (
                    <ToggleGroupItem
                      className="data-[state=on]:bg-muted-foreground/20"
                      key={idx}
                      value={shape.id}
                    >
                      {shape.key}
                    </ToggleGroupItem>
                  ),
                )}
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

export default BooleanEffectForm;
