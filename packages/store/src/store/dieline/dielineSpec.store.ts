import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Point = { x: string; y: string };
type layer = { layer: "trim" | "fold" | "perf" };

export type LineSpec = {
  length: string;
  angle?: number;
  origin?: Point;
} & layer;
export type RectangleSpec = { width: string; height: string } & layer;

export type Shapes = Partial<{
  line: Record<string, LineSpec>;
  rectangle: Record<string, RectangleSpec>;
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
export const useDielineSpecStore = create<DielineSpecStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "dieline-spec-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getDielineSpec = useDielineSpecStore.getState;
