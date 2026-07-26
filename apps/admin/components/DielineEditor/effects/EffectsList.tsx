import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { IEffect, useEffectStore } from "@repo/store/editor/effects.store";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { RadiusFormType } from "./Effects";
import { Trash } from "lucide-react";

const EffectsList = ({
  effects,
  shapes,
  radiusForm,
  setEffectFormType,
}: {
  effects: IEffect.EffectsMap;
  shapes: ISpec.Shapes;
  radiusForm: UseFormReturn<RadiusFormType, any, RadiusFormType>;
  setEffectFormType: (type: IEffect.EffectTypes) => void;
}) => {
  const { removeEffect } = useEffectStore();
  function resolveRef(
    id: string,
    effectOn: "effect" | "shape",
    shapesById: Map<string, ISpec.ShapesSpec>,
    effectsById: Map<string, IEffect.EffectSpec>,
  ) {
    return effectOn === "effect" ? effectsById.get(id) : shapesById.get(id);
  }

  const shapesById = useMemo(
    () => new Map(shapes.map((s) => [s.id, s])),
    [shapes],
  );
  const effectsById = useMemo(
    () => new Map(effects.map((e) => [e.id, e])),
    [effects],
  );

  const { booleanEffects, radiusEffects } = useMemo(() => {
    const booleanEffects: (IEffect.BooleanEffectSpec & {
      targetObject?: ISpec.ShapesSpec | IEffect.EffectSpec;
      originObject?: ISpec.ShapesSpec | IEffect.EffectSpec;
    })[] = [];
    const radiusEffects: (IEffect.RadiusEffectSpec & {
      targetObject?: ISpec.ShapesSpec | IEffect.EffectSpec;
    })[] = [];
    const unresolved: string[] = [];

    for (const e of effects) {
      const targetObject = resolveRef(
        e.targetModelId,
        e.effectOn,
        shapesById,
        effectsById,
      );
      if (!targetObject)
        unresolved.push(`${e.id}: target "${e.targetModelId}" not found`);

      if (e.type === "boolean") {
        const originObject = resolveRef(
          e.originModelId,
          e.effectOn,
          shapesById,
          effectsById,
        );
        if (!originObject)
          unresolved.push(`${e.id}: origin "${e.originModelId}" not found`);
        booleanEffects.push({ ...e, targetObject, originObject });
      } else if (e.type === "radius") {
        radiusEffects.push({ ...e, targetObject });
      }
    }

    return { booleanEffects, radiusEffects, unresolved };
  }, [effects, shapesById, effectsById]);

  const handleEffectSelection = (e: IEffect.EffectSpec) => {
    if (e.type === "radius") {
      radiusForm.reset({
        radius: String(e.radius),
        targetModelId: e.targetModelId,
        key: e.key,
      });
      setEffectFormType("radius");
    } else {
      console.log("todo");
    }
  };

  const onRemoveEffect = (id: string) => {
    removeEffect(id);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Boolean</Label>
        {booleanEffects.map((e, idx) => (
          <Button
            size={"sm"}
            variant={"ghost"}
            key={idx}
            className="justify-between w-full border-b rounded-none py-4"
            onClick={() => console.log(e.id)}
          >
            <span className="text-xs">{e.key}</span>
            <span className="text-muted-foreground text-xs">
              {e.booleanType}
            </span>
          </Button>
        ))}
      </div>

      <div>
        <Label>Radius</Label>
        {radiusEffects.map((e, idx) => (
          <div
            key={idx}
            className="flex justify-between w-full border-b rounded-sm items-center cursor-pointer hover:bg-muted-foreground/10 py-2 group px-2"
            onClick={() => handleEffectSelection(e)}
          >
            <span className="text-xs">{e.key}</span>
            <span className="text-muted-foreground text-xs group-hover:hidden">
              {e.radius}pt
            </span>
            <Trash
              className="hidden group-hover:block text-muted-foreground hover:text-destructive"
              size={12}
              onClick={(event) => {
                event.stopPropagation();
                onRemoveEffect(e.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EffectsList;
