import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export namespace IEffect {
  export type EffectOn = "shape" | "effect";
  export type EffectTypes = "boolean" | "radius";
  type ModelId = string;

  interface EffectBase {
    id: string;
    hidden?: boolean;
    effectOn: EffectOn;
    key: string;
  }

  export interface BooleanEffectSpec extends EffectBase {
    type: "boolean";
    booleanType: "union" | "subtract" | "intersect";
    targetModelId: ModelId;
    originModelId: ModelId;
  }

  export interface RadiusEffectSpec extends EffectBase {
    type: "radius";
    targetModelId: ModelId;
    radius: number;
    // indices?: number[];
  }

  export type EffectSpec = BooleanEffectSpec | RadiusEffectSpec;
  export type EffectsMap = EffectSpec[];
}

interface VariableStore {
  effects: IEffect.EffectsMap;
  setEffect: (effect: IEffect.EffectSpec) => void;
  setEffects: (effects: IEffect.EffectsMap) => void;
  removeEffect: (id: string) => void;
  updateEffect: (effect: IEffect.EffectSpec) => void;
}

export const useEffectStore = create<VariableStore>()((set) => ({
  effects: [],

  setEffect: (effect) =>
    set((state) => {
      const currentEffects = state.effects;
      let id = uuidv4();
      while (currentEffects.some((e) => e.id === id)) {
        id = uuidv4();
      }

      return {
        effects: [...currentEffects, { ...effect, id } as IEffect.EffectSpec],
      };
    }),

  setEffects: (effects) => set(() => ({ effects })),

  removeEffect: (id) =>
    set((state) => ({
      effects: state.effects.filter((v) => v.id !== id),
    })),

  updateEffect: (effect) =>
    set((state) => ({
      effects: state.effects.map((e) => (e.id === effect.id ? effect : e)),
    })),
}));

export const getEffects = () => useEffectStore.getState().effects;
