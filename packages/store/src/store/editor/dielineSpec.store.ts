import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export namespace ISpec {
  type DupOperation =
    | { type: "zero" }
    | { type: "center" }
    | { type: "mirror"; x: boolean; y: boolean }
    | { type: "move"; value: Point }
    | { type: "moveTo"; value: Point }
    | { type: "rotate"; value: string }
    | { type: "scale"; value: string };

  export type Layer = "trim" | "fold" | "perf";
  type Point = [string, string];
  type Generals = {
    id: string;
    key: string;
    type: ShapesKey;
    hidden: boolean;
    layer: Layer;
    origin: Point;
    dup?: {
      operations: DupOperation[];
    }[];
  };
  export type Direction = "up" | "down" | "right" | "left";

  export type LineSpec = Record<"length" | "angle", string> & Generals;
  export type LinesSpec = {
    absolutePts?: [string, string][];
    relativePts?: {
      pts: [string, string | undefined, Direction | "draw"][];
      startPt: Point;
    };
    isClosed: boolean;
    filletRadius?: string;
    indices?: string;
    isRelative: boolean;
  } & Generals;
  export type RectangleSpec = Record<"width" | "height" | "radius", string> & {
    deleteSide?: Direction;
  } & Generals;
  export type CircleSpec = {
    radius: string;
    semiCircleDirection: Direction;
  } & Generals;
  export type PolygonSpec = Record<
    "radius" | "sides" | "firstCornerAngle",
    string
  > &
    Generals;
  export type ArcSpec = Record<"radius" | "startAngle" | "endAngle", string> &
    Generals;

  export type Shapes = Partial<{
    line: LineSpec[];
    lines: LinesSpec[];
    rectangle: RectangleSpec[];
    circle: CircleSpec[];
    polygon: PolygonSpec[];
    arc: ArcSpec[];
  }>;

  export type Ruler = {
    from: Point;
    to: Point;
    value: string;
    offset: string;
    type: "ruler";
  } & Omit<Generals, "type" | "layer" | "origin" | "dup">;
  export type Rulers = Ruler[];

  export type ShapesKey = keyof Shapes;
  export type ShapesMap = NonNullable<Shapes[ShapesKey]>;
  export type ShapesSpec = ShapesMap[number];
}

interface DielineSpecStore {
  //! Shapes
  shapes: ISpec.Shapes;
  setShape: <T extends ISpec.ShapesKey>(
    type: T,
    spec: NonNullable<ISpec.Shapes[T]>[number],
  ) => void;
  setShapes: (shapes: ISpec.Shapes) => void;
  setShapeVisibility: (type: ISpec.ShapesKey, id: string) => void;
  updateShape: <T extends ISpec.ShapesKey>(
    type: T,
    id: string,
    newSpec: ISpec.ShapesSpec,
  ) => void;
  removeShape: (type: ISpec.ShapesKey, id: string) => void;

  //! Rulers
  rulers: ISpec.Rulers;
  setRuler: (ruler: ISpec.Ruler) => void;
  removeRuler: (id: string) => void;
  updateRuler: (ruler: ISpec.Ruler) => void;
  setRulerVisibility: (id: string) => void;

  //! Models
}

export const useDielineSpecStore = create<DielineSpecStore>()(
  persist(
    (set) => ({
      shapes: {},
      rulers: [],

      //! Shapes ------------------------------------
      setShape: (type, spec) =>
        set((state) => {
          const currentShapes = state.shapes[type] || [];

          let id = uuidv4();
          while (currentShapes.some((shape) => shape.id === id)) {
            id = uuidv4();
          }

          return {
            preShapes: state.shapes,
            shapes: {
              ...state.shapes,
              [type]: [...currentShapes, { ...spec, id }],
            },
          };
        }),

      setShapes: (shapes) =>
        set(() => ({
          shapes,
        })),

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

      //! Rulers ------------------------------------
      setRuler: (ruler) =>
        set((state) => {
          let id = uuidv4();
          while (state.rulers.some((ruler) => ruler.id === id)) {
            id = uuidv4();
          }

          return {
            rulers: [...state.rulers, { ...ruler, id }],
          };
        }),

      removeRuler: (id) =>
        set((state) => ({ rulers: state.rulers.filter((r) => r.id !== id) })),

      updateRuler: (ruler) =>
        set((state) => {
          const updatedRulers = state.rulers.map((r) =>
            r.id === ruler.id ? ruler : r,
          );

          return {
            rulers: updatedRulers,
          };
        }),

      setRulerVisibility: (id: string) =>
        set((state) => {
          const updatedRulers = state.rulers.map((r) =>
            r.id === id ? { ...r, hidden: !r.hidden } : r,
          );

          return {
            rulers: updatedRulers,
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
