import { useAppDispatch } from "@repo/store/hooks";
import { removeEffect } from "@repo/store/slices/effectsSlice";
import { IEffect, ISpec } from "@repo/store/types";
import { Label } from "@repo/ui/components/label";
import { Trash } from "lucide-react";
import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { BooleanFormType } from "./Effects";

const EffectsList = ({
  effects,
  shapes,
  setEffectFormType,
  booleanForm,
}: {
  effects: IEffect.EffectsMap;
  shapes: ISpec.Nodes;
  booleanForm: UseFormReturn<BooleanFormType, any, BooleanFormType>;
  setEffectFormType: (type: IEffect.EffectTypes) => void;
}) => {
  const dispatch = useAppDispatch();

  function resolveRef(
    id: string,
    effectOn: "effect" | "shape",
    shapesById: Map<string, ISpec.Node>,
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

  const { booleanEffects } = useMemo(() => {
    const booleanEffects: (IEffect.BooleanEffectSpec & {
      targetObject?: ISpec.Node | IEffect.EffectSpec;
      originObject?: ISpec.Node | IEffect.EffectSpec;
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
      }
    }

    return { booleanEffects, unresolved };
  }, [effects, shapesById, effectsById]);

  const handleEffectSelection = (e: IEffect.EffectSpec) => {
    booleanForm.reset({
      originModelId: e.originModelId,
      booleanType: e.booleanType,
      targetModelId: e.targetModelId,
      key: e.key,
    });
    setEffectFormType("boolean");
  };

  const onRemoveEffect = (id: string) => {
    dispatch(removeEffect(id));
  };

  const effectsArr = [{ key: "Boolean", effects: booleanEffects }];

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
                {effect.booleanType}
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
