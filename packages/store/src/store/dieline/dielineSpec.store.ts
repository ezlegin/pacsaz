import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export namespace ISpec {
  export type Layer = "trim" | "fold" | "perf";
  type Point = [string, string];
  type generals = {
    id: string;
    key: string;
    layer: Layer;
    hidden: boolean;
    origin: Point;
    type: ShapesKey;
  };

  export type LineSpec = Record<"length" | "angle", string> & generals;
  export type LinesSpec = { pts: [string, string][] } & generals;
  export type RectangleSpec = Record<"width" | "height", string> & generals;
  export type CircleSpec = Record<"radius", string> & generals;

  export type Shapes = Partial<{
    line: LineSpec[];
    lines: LinesSpec[];
    rectangle: RectangleSpec[];
    circle: CircleSpec[];
  }>;

  export type ShapesKey = keyof Shapes;
  export type ShapesMap = NonNullable<Shapes[ShapesKey]>;
  export type ShapesSpec = ShapesMap[number];
}

interface DielineSpecStore {
  shapes: ISpec.Shapes;

  setShape: <T extends ISpec.ShapesKey>(
    type: T,
    spec: NonNullable<ISpec.Shapes[T]>[number],
  ) => void;
  setShapeVisibility: (type: ISpec.ShapesKey, id: string) => void;
  updateShape: <T extends ISpec.ShapesKey>(
    type: T,
    id: string,
    newSpec: ISpec.ShapesSpec,
  ) => void;
  removeShape: (type: ISpec.ShapesKey, id: string) => void;
}

export const useDielineSpecStore = create<DielineSpecStore>()(
  persist(
    (set) => ({
      shapes: {},

      setShape: (type, spec) =>
        set((state) => {
          const currentShapes = state.shapes[type] || [];

          let id = uuidv4();
          while (currentShapes.some((shape) => shape.id === id)) {
            id = uuidv4();
          }

          return {
            shapes: {
              ...state.shapes,
              [type]: [...currentShapes, { ...spec, id }],
            },
          };
        }),

      setShapeVisibility: (type, id) =>
        set((state) => {
          const currentShapes = state.shapes[type];
          if (!currentShapes) return state;

          const updatedShapes = currentShapes.map((item) =>
            item.id === id ? { ...item, hidden: !item.hidden } : item,
          );

          return {
            shapes: {
              ...state.shapes,
              [type]: updatedShapes,
            },
          };
        }),

      updateShape: (type, id, newSpec) =>
        set((state) => {
          const currentShapes = state.shapes[type];
          if (!currentShapes) return state;

          const updatedShapes = currentShapes.map((item) =>
            item.id === id ? { ...item, ...newSpec } : item,
          );

          return {
            shapes: {
              ...state.shapes,
              [type]: updatedShapes,
            },
          };
        }),

      removeShape: (type, key) =>
        set((state) => ({
          shapes: {
            ...state.shapes,
            [type]: state.shapes[type]?.filter((spec) => spec.id !== key),
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
