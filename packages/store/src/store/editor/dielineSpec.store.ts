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

  export type Stack = "shape" | "model" | "ruler";
  export type Layer = "trim" | "fold" | "perf";
  export type Dup = {
    operations: DupOperation[];
  }[];
  type Point = [string, string];
  type Generals = {
    id: string;
    key: string;
    type: ShapesKey;
    stack: Stack;
    hidden: boolean;
    layer: Layer;
    origin: Point;
    dup?: Dup;
  };
  export type Direction = "up" | "down" | "right" | "left";

  //! Shapes --------------------------------------

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
  export type ShapesKey = keyof Shapes;
  export type ShapesMap = NonNullable<Shapes[ShapesKey]>;
  export type ShapesSpec = ShapesMap[number];

  //! Models --------------------------------------
  type DustSide = "left" | "right" | "both";
  type ModelGenerals = Omit<Generals, "layer" | "type"> & { type: ModelsKey };
  export type GlueSpec = { from: Point; to: Point } & ModelGenerals;
  export type DoorSpec = {
    dustSide?: DustSide;
    mirror: { x: boolean; y: boolean };
    indentAt: { l: boolean; r: boolean };
  } & ModelGenerals;
  export type ModelsKey = keyof Models;
  export type Models = Partial<{
    glue: GlueSpec[];
    door: DoorSpec[];
  }>;
  export type ModelsMap = NonNullable<Models[ModelsKey]>;
  export type ModelsSpec = ModelsMap[number];

  //! Rulers --------------------------------------
  export type Ruler = {
    from: Point;
    to: Point;
    value: string;
    offset: string;
    type: "ruler";
  } & Omit<Generals, "type" | "layer" | "origin" | "dup">;
  export type Rulers = Ruler[];
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
    newSpec: NonNullable<ISpec.Shapes[T]>[number],
  ) => void;
  removeShape: (type: ISpec.ShapesKey, id: string) => void;

  //! Rulers
  rulers: ISpec.Rulers;
  setRuler: (ruler: ISpec.Ruler) => void;
  removeRuler: (id: string) => void;
  updateRuler: (ruler: ISpec.Ruler) => void;
  setRulerVisibility: (id: string) => void;

  //! Models
  models: ISpec.Models;
  setModel: <T extends ISpec.ModelsKey>(
    type: T,
    spec: NonNullable<ISpec.Models[T]>[number],
  ) => void;
  updateModel: <T extends ISpec.ModelsKey>(
    type: T,
    id: string,
    newSpec: NonNullable<ISpec.Models[T]>[number],
  ) => void;
  setModelVisibility: (type: ISpec.ModelsKey, id: string) => void;
  removeModel: (type: ISpec.ModelsKey, id: string) => void;
}

export const useDielineSpecStore = create<DielineSpecStore>()(
  persist(
    (set) => ({
      shapes: {},
      rulers: [],
      models: [],

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

      //! Models ------------------------------------
      setModel: (type, spec) =>
        set((state) => {
          const currentModels = state.models[type] || [];

          let id = uuidv4();
          while (currentModels.some((model) => model.id === id)) {
            id = uuidv4();
          }

          return {
            models: {
              ...state.models,
              [type]: [...currentModels, { ...spec, id }],
            },
          };
        }),

      updateModel: (type, id, newSpec) =>
        set((state) => {
          const currentModels = state.models[type];
          if (!currentModels) return state;

          const updatedModels = currentModels.map((item) =>
            item.id === id ? { ...item, ...newSpec } : item,
          );

          return {
            models: {
              ...state.models,
              [type]: updatedModels,
            },
          };
        }),

      setModelVisibility: (type, id) =>
        set((state) => {
          const currentModels = state.models[type];
          if (!currentModels) return state;

          const updatedModels = currentModels.map((item) =>
            item.id === id ? { ...item, hidden: !item.hidden } : item,
          );

          return {
            models: {
              ...state.models,
              [type]: updatedModels,
            },
          };
        }),

      removeModel: (type, key) =>
        set((state) => ({
          models: {
            ...state.models,
            [type]: state.models[type]?.filter((spec) => spec.id !== key),
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
