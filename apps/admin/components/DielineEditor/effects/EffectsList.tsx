import { Label } from "@repo/ui/components/label";
import { Trash } from "lucide-react";
import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { BooleanFormType, RadiusFormType } from "./Effects";
import { IEffect, ISpec } from "@repo/store/types";
import { useAppDispatch } from "@repo/store/hooks";
import { removeEffect } from "@repo/store/slices/effectsSlice";

const EffectsList = ({
  effects,
  shapes,
  radiusForm,
  setEffectFormType,
  booleanForm,
}: {
  effects: IEffect.EffectsMap;
  shapes: ISpec.Shapes;
  radiusForm: UseFormReturn<RadiusFormType, any, RadiusFormType>;
  booleanForm: UseFormReturn<BooleanFormType, any, BooleanFormType>;
  setEffectFormType: (type: IEffect.EffectTypes) => void;
}) => {
  const dispatch = useAppDispatch();

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
        indices: e.indices,
      });
      setEffectFormType("radius");
    } else {
      booleanForm.reset({
        originModelId: e.originModelId,
        booleanType: e.booleanType,
        targetModelId: e.targetModelId,
        key: e.key,
      });
      setEffectFormType("boolean");
    }
  };

  const onRemoveEffect = (id: string) => {
    dispatch(removeEffect(id));
  };

  const effectsArr = [
    { key: "Boolean", effects: booleanEffects },
    { key: "Radius", effects: radiusEffects },
  ];

  return (
    <div className="space-y-4">
      {effectsArr.map((e, idx) => (
        <div key={idx}>
          <Label>{e.key}</Label>
          {e.effects.length < 1 && (
            <div className="text-center text-xs text-muted-foreground py-2">
              No Effects.
            </div>
          )}
          {e.effects.map((effect, idx) => (
            <div
              key={idx}
              className="flex justify-between w-full border-b rounded-sm items-center cursor-pointer hover:bg-muted-foreground/10 py-2 group px-2"
              onClick={() => handleEffectSelection(effect)}
            >
              <span className="text-xs">{effect.key}</span>
              <span className="text-muted-foreground text-xs group-hover:hidden">
                {effect.type === "boolean"
                  ? effect.booleanType
                  : effect.indices.length > 0
                    ? "Ind"
                    : effect.radius}
              </span>
              <Trash
                className="hidden group-hover:block text-muted-foreground hover:text-destructive"
                size={12}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveEffect(effect.id);
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EffectsList;
