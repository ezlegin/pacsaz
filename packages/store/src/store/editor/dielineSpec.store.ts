import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

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
    stack: Stack;
    hidden: boolean;
    layer: Layer;
    origin: Point;
    dup?: Dup;
  };

  export type Direction = "up" | "down" | "right" | "left";

  //! Shapes --------------------------------------

  export type LineSpec = Record<"length" | "angle", string> &
    Generals & { type: "line" };

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
  } & Generals & { type: "lines" };

  export type RectangleSpec = Record<"width" | "height" | "radius", string> & {
    deleteSide?: Direction;
  } & Generals & { type: "rectangle" };

  export type CircleSpec = {
    radius: string;
    semiCircleDirection: Direction;
  } & Generals & { type: "circle" };

  export type PolygonSpec = Record<
    "radius" | "sides" | "firstCornerAngle",
    string
  > &
    Generals & { type: "polygon" };

  export type ArcSpec = Record<"radius" | "startAngle" | "endAngle", string> &
    Generals & { type: "arc" };

  export type ShapesSpec =
    | LineSpec
    | LinesSpec
    | RectangleSpec
    | CircleSpec
    | PolygonSpec
    | ArcSpec;

  export type ShapesKey = ShapesSpec["type"];
  export type Shapes = ShapesSpec[];

  //! Models --------------------------------------
  type DustSide = "left" | "right" | "both";
  type ModelGenerals = Omit<Generals, "layer" | "type"> & { type: ModelsKey };
  export type GlueSpec = { from: Point; to: Point } & ModelGenerals;
  export type DoorSpec = {
    dustSide?: DustSide;
    mirror: { x: boolean; y: boolean };
    indentAt: { l: boolean; r: boolean };
  } & ModelGenerals;
  export type SnapLockSpec = ModelGenerals;

  export type Models = Partial<{
    glue: GlueSpec[];
    door: DoorSpec[];
    snapLock: SnapLockSpec[];
  }>;
  export type ModelsKey = keyof Models;
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

  //! Specs --------------------------------------
  export type Specs = {
    shapes: ISpec.Shapes;
    models: ISpec.Models;
    rulers: ISpec.Rulers;
  };
}

interface DielineSpecStore {
  specs: ISpec.Specs;
  setSpecs: (spec: ISpec.Specs) => void;

  //! Shapes — flattened, no more `type` param
  setShape: (spec: Omit<ISpec.ShapesSpec, "id">) => void;
  setShapes: (shapes: ISpec.Shapes) => void;
  setShapeVisibility: (id: string) => void;
  updateShape: (id: string, newSpec: Partial<ISpec.ShapesSpec>) => void;
  removeShape: (id: string) => void;

  //! Rulers
  setRuler: (ruler: ISpec.Ruler) => void;
  removeRuler: (id: string) => void;
  updateRuler: (ruler: ISpec.Ruler) => void;
  setRulerVisibility: (id: string) => void;

  //! Models
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

export const useDielineSpecStore = create<DielineSpecStore>()((set) => ({
  specs: {
    shapes: [],
    rulers: [],
    models: [],
  },

  setSpecs: (specs) => set(() => ({ specs })),

  //! Shapes ------------------------------------
  setShape: (spec) =>
    set((state) => {
      const currentShapes = state.specs.shapes;

      let id = uuidv4();
      while (currentShapes.some((shape) => shape.id === id)) {
        id = uuidv4();
      }

      return {
        specs: {
          ...state.specs,
          shapes: [...currentShapes, { ...spec, id } as ISpec.ShapesSpec],
        },
      };
    }),

  setShapes: (shapes) =>
    set((state) => ({
      specs: {
        ...state.specs,
        shapes,
      },
    })),

  setShapeVisibility: (id) =>
    set((state) => ({
      specs: {
        ...state.specs,
        shapes: state.specs.shapes.map((item) =>
          item.id === id ? { ...item, hidden: !item.hidden } : item,
        ),
      },
    })),

  updateShape: (id, newSpec) =>
    set((state) => ({
      specs: {
        ...state.specs,
        shapes: state.specs.shapes.map((item) =>
          item.id === id ? ({ ...item, ...newSpec } as ISpec.ShapesSpec) : item,
        ),
      },
    })),

  removeShape: (id) =>
    set((state) => ({
      specs: {
        ...state.specs,
        shapes: state.specs.shapes.filter((spec) => spec.id !== id),
      },
    })),

  //! Models ------------------------------------
  setModel: (type, spec) =>
    set((state) => {
      const currentModels = state.specs.models[type] || [];

      let id = uuidv4();
      while (currentModels.some((model) => model.id === id)) {
        id = uuidv4();
      }

      return {
        specs: {
          ...state.specs,
          models: {
            ...state.specs.models,
            [type]: [...currentModels, { ...spec, id }],
          },
        },
      };
    }),

  updateModel: (type, id, newSpec) =>
    set((state) => {
      const currentModels = state.specs.models[type];
      if (!currentModels) return state;

      const updatedModels = currentModels.map((item) =>
        item.id === id ? { ...item, ...newSpec } : item,
      );

      return {
        specs: {
          ...state.specs,
          models: {
            ...state.specs.models,
            [type]: updatedModels,
          },
        },
      };
    }),

  setModelVisibility: (type, id) =>
    set((state) => {
      const currentModels = state.specs.models[type];
      if (!currentModels) return state;

      const updatedModels = currentModels.map((item) =>
        item.id === id ? { ...item, hidden: !item.hidden } : item,
      );

      return {
        specs: {
          ...state.specs,
          models: {
            ...state.specs.models,
            [type]: updatedModels,
          },
        },
      };
    }),

  removeModel: (type, key) =>
    set((state) => ({
      specs: {
        ...state.specs,
        models: {
          ...state.specs.models,
          [type]: state.specs.models[type]?.filter((spec) => spec.id !== key),
        },
      },
    })),

  //! Rulers ------------------------------------
  setRuler: (ruler) =>
    set((state) => {
      let id = uuidv4();
      while (state.specs.rulers.some((ruler) => ruler.id === id)) {
        id = uuidv4();
      }

      return {
        specs: {
          ...state.specs,
          rulers: [...state.specs.rulers, { ...ruler, id }],
        },
      };
    }),

  removeRuler: (id) =>
    set((state) => ({
      specs: {
        ...state.specs,
        rulers: state.specs.rulers.filter((r) => r.id !== id),
      },
    })),

  updateRuler: (ruler) =>
    set((state) => {
      const updatedRulers = state.specs.rulers.map((r) =>
        r.id === ruler.id ? ruler : r,
      );

      return {
        specs: {
          ...state.specs,
          rulers: updatedRulers,
        },
      };
    }),

  setRulerVisibility: (id: string) =>
    set((state) => {
      const updatedRulers = state.specs.rulers.map((r) =>
        r.id === id ? { ...r, hidden: !r.hidden } : r,
      );

      return {
        specs: {
          ...state.specs,
          rulers: updatedRulers,
        },
      };
    }),
}));

export const getDielineSpec = useDielineSpecStore.getState;
