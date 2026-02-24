import { create } from "zustand";

interface Shapes {
  line: Record<string, { length: string }>;
  rectangle: Record<string, {}>;
}

interface DielineSpec {
  slug: string;
  title: string;
  shapes: Partial<Shapes>;
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
