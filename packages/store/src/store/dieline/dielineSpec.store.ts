import { create } from "zustand";

type Point = { x: string; y: string };
export type LineSpec = { length: string; angle?: number; origin?: Point };

export type Shapes = Partial<{
  line: Record<string, LineSpec>;
  rectangle: Record<string, {}>;
}>;

interface DielineSpec {
  slug: string;
  title: string;
  shapes: Shapes;
}

type DielineSpecStore = {
  dielineSpec: DielineSpec;
  setDielineSpec: (
    key: keyof DielineSpec,
    val: DielineSpec[keyof DielineSpec],
  ) => void;
};

export const useDielineSpecStore = create<DielineSpecStore>((set) => ({
  dielineSpec: {
    slug: "dev",
    title: "جعبه تاک اند",
    shapes: {},
  },

  setDielineSpec: (key, val) =>
    set((state) => ({
      dielineSpec: {
        ...state.dielineSpec,
        [key]: val,
      },
    })),
}));

export const getDielineSpec = useDielineSpecStore.getState;
