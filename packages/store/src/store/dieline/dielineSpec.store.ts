import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Point = { x: string; y: string };
type generals = {
  layer?: "trim" | "fold" | "perf";
  hidden?: boolean;
  origin?: Point;
};

export type LineSpec = Record<"length" | "angle", string> & generals;
export type RectangleSpec = Record<"width" | "height", string> & generals;

export type Shapes = Partial<{
  line: Record<string, LineSpec>;
  rectangle: Record<string, RectangleSpec>;
}>;
export type ShapesKey = keyof Shapes;
export type Specs = NonNullable<Shapes[ShapesKey]>[string];

interface DielineSpecStore {
  dielineSpec: {
    shapes: Shapes;
  };
  setShape: <T extends ShapesKey>(
    type: T,
    key: string,
    spec: NonNullable<Shapes[T]>[string],
  ) => void;
  setShapeVisibility: (
    type: ShapesKey,
    key: string,
    isVisible: boolean,
  ) => void;
  updateShape: <T extends ShapesKey>(
    type: T,
    key: string,
    spec: NonNullable<Shapes[T]>[string],
  ) => void;
  removeShape: (type: ShapesKey, key: string) => void;
}

export const useDielineSpecStore = create<DielineSpecStore>()(
  persist(
    (set) => ({
      dielineSpec: {
        shapes: {},
      },

      setShape: (type, key, spec) =>
        set((state) => ({
          dielineSpec: {
            ...state.dielineSpec,
            shapes: {
              ...state.dielineSpec.shapes,
              [type]: {
                ...(state.dielineSpec.shapes[type] || {}),
                [key]: spec,
              },
            },
          },
        })),

      updateShape: (type, key, spec) =>
        set((state) => ({
          dielineSpec: {
            ...state.dielineSpec,
            shapes: {
              ...state.dielineSpec.shapes,
              [type]: {
                ...state.dielineSpec.shapes[type],
                [key]: spec,
              },
            },
          },
        })),

      setShapeVisibility: (type, key, isVisible) =>
        set((state) => ({
          dielineSpec: {
            ...state.dielineSpec,
            shapes: {
              ...state.dielineSpec.shapes,
              [type]: {
                ...state.dielineSpec.shapes[type],
                [key]: {
                  ...state.dielineSpec.shapes[type]?.[key],
                  hidden: !isVisible,
                },
              },
            },
          },
        })),

      removeShape: (type, key) =>
        set((state) => {
          const currentShapes = state.dielineSpec.shapes[type];
          if (!currentShapes) return state;

          const { [key]: _, ...remaining } = currentShapes;
          return {
            dielineSpec: {
              ...state.dielineSpec,
              shapes: {
                ...state.dielineSpec.shapes,
                [type]: remaining,
              },
            },
          };
        }),
    }),
    {
      name: "dieline-spec-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getDielineSpec = useDielineSpecStore.getState;
