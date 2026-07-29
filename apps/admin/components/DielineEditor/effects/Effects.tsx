"use client";

import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { SquareRoundCorner, SquaresUnite } from "lucide-react";
import { useState } from "react";
import BooleanEffectForm from "./BooleanEffectForm";
import EffectsList from "./EffectsList";
import RadiusEffectForm from "./RadiusEffectForm";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IEffect } from "@repo/store/types";
import { useAppSelector } from "@repo/store/hooks";
import { shapesSelectors } from "@repo/store/slices/shapesSlice";
import { effectsSelectors } from "@repo/store/slices/effectsSlice";

const radiusFormSchema = z.object({
  radius: z.string().min(1),
  targetModelId: z.string().min(1),
  key: z.string().min(1),
  indices: z.array(
    z.object({
      indice: z.string().min(1),
      radius: z.string().min(1),
    }),
  ),
});

export type RadiusFormType = z.infer<typeof radiusFormSchema>;

const booleanFormSchema = z.object({
  booleanType: z.enum(["intersect", "subtract", "union"]),
  originModelId: z.string().min(1),
  targetModelId: z.string().min(1),
  key: z.string().min(1),
});
export type BooleanFormType = z.infer<typeof booleanFormSchema>;

export const Effects = () => {
  const [effectFormType, setEffectFormType] =
    useState<IEffect.EffectTypes | null>(null);
  const radiusForm = useForm<RadiusFormType>({
    resolver: zodResolver(radiusFormSchema),
    defaultValues: {
      radius: "12",
      targetModelId: "",
      key: "radius",
      indices: [],
    },
  });
  const booleanForm = useForm<BooleanFormType>({
    resolver: zodResolver(booleanFormSchema),
    defaultValues: {
      booleanType: "union",
      originModelId: "",
      targetModelId: "",
      key: "boolean",
    },
  });

  const effects = useAppSelector(effectsSelectors.selectAll);
  const shapes = useAppSelector(shapesSelectors.selectAll);

  if (effectFormType === "radius")
    return (
      <RadiusEffectForm
        form={radiusForm}
        closeForm={() => setEffectFormType(null)}
        shapes={shapes}
      />
    );
  if (effectFormType === "boolean")
    return (
      <BooleanEffectForm
        form={booleanForm}
        closeForm={() => setEffectFormType(null)}
        shapes={shapes}
      />
    );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Effects</Label>
        <div className="flex gap-4">
          <Button
            onClick={() => setEffectFormType("boolean")}
            size={"sm"}
            variant={"outline"}
            type="button"
          >
            + <SquaresUnite className="scale-90" />
            Boolean
          </Button>
          <Button
            onClick={() => setEffectFormType("radius")}
            size={"sm"}
            variant={"outline"}
            type="button"
          >
            + <SquareRoundCorner className="scale-90" />
            Radius
          </Button>
        </div>
      </div>

      <EffectsList
        effects={effects}
        shapes={shapes}
        radiusForm={radiusForm}
        booleanForm={booleanForm}
        setEffectFormType={setEffectFormType}
      />
    </div>
  );
};
