import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export namespace ISpec {
  type Layer = "trim" | "fold" | "perf";
  type Point = [string, string];
  type generals = {
    id?: string;
    key: string;
    layer: Layer;
    hidden: boolean;
    origin: Point;
    type: ShapesKey;
  };

  export type LineSpec = Record<"length" | "angle", string> & generals;
  export type RectangleSpec = Record<"width" | "height", string> & generals;
  export type CircleSpec = Record<"radius", string> & generals;

  export type Shapes = Partial<{
    line: LineSpec[];
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
  // setShapeVisibility: (
  //   type: ISpec.ShapesKey,
  //   key: string,
  //   isVisible: boolean,
  // ) => void;
  // updateShape: <T extends ISpec.ShapesKey>(
  //   type: T,
  //   key: string,
  //   spec: ISpec.ShapesSpec,
  // ) => void;
  // removeShape: (type: ISpec.ShapesKey, key: string) => void;
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

      //   updateShape: (type, key, spec) =>
      //     set((state) => ({
      //       dielineSpec: {
      //         ...state.dielineSpec,
      //         shapes: {
      //           ...state.dielineSpec.shapes,
      //           [type]: {
      //             ...state.dielineSpec.shapes[type],
      //             [key]: spec,
      //           },
      //         },
      //       },
      //     })),

      //   setShapeVisibility: (type, key, isVisible) =>
      //     set((state) => ({
      //       dielineSpec: {
      //         ...state.dielineSpec,
      //         shapes: {
      //           ...state.dielineSpec.shapes,
      //           [type]: {
      //             ...state.dielineSpec.shapes[type],
      //             [key]: {
      //               ...state.dielineSpec.shapes[type]?.[key],
      //               hidden: !isVisible,
      //             },
      //           },
      //         },
      //       },
      //     })),

      //   removeShape: (type, key) =>
      //     set((state) => {
      //       const currentShapes = state.dielineSpec.shapes[type];
      //       if (!currentShapes) return state;

      //       const { [key]: _, ...remaining } = currentShapes;
      //       return {
      //         dielineSpec: {
      //           ...state.dielineSpec,
      //           shapes: {
      //             ...state.dielineSpec.shapes,
      //             [type]: remaining,
      //           },
      //         },
      //       };
      //     }),
    }),
    {
      name: "dieline-spec-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getDielineSpec = useDielineSpecStore.getState;
