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
  type ModelGenerals = Omit<Generals, "layer">;
  export type GlueSpec = { from: Point; to: Point } & ModelGenerals & {
      type: "glue";
    };
  export type DoorSpec = {
    dustSide?: DustSide;
    mirror: { x: boolean; y: boolean };
    indentAt: { l: boolean; r: boolean };
  } & ModelGenerals & { type: "door" };
  export type SnapLockSpec = ModelGenerals & { type: "snapLock" };

  export type ModelsSpec = GlueSpec | DoorSpec | SnapLockSpec;

  export type ModelsKey = ModelsSpec["type"];
  export type Models = ModelsSpec[];

  //! Rulers --------------------------------------
  export type Ruler = {
    from: Point;
    to: Point;
    value: string;
    offset: string;
    type: "ruler";
  } & Omit<Generals, "layer" | "origin" | "dup">;
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
  setModel: (spec: ISpec.ModelsSpec) => void;
  updateModel: (id: string, newSpec: Partial<ISpec.ModelsSpec>) => void;
  setModelVisibility: (id: string) => void;
  removeModel: (id: string) => void;
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
  setModel: (spec) =>
    set((state) => {
      const currentModels = state.specs.models;

      let id = uuidv4();
      while (currentModels.some((model) => model.id === id)) {
        id = uuidv4();
      }

      return {
        specs: {
          ...state.specs,
          models: currentModels.concat({ ...spec, id }),
        },
      };
    }),

  updateModel: (id, newSpec) =>
    set((state) => {
      const currentModels = state.specs.models;

      const updatedModels = currentModels.map((item) =>
        item.id === id ? ({ ...item, ...newSpec } as ISpec.ModelsSpec) : item,
      );

      return {
        specs: {
          ...state.specs,
          models: updatedModels,
        },
      };
    }),

  setModelVisibility: (id) =>
    set((state) => {
      const currentModels = state.specs.models;

      const updatedModels = currentModels.map((item) =>
        item.id === id ? { ...item, hidden: !item.hidden } : item,
      );

      return {
        specs: {
          ...state.specs,
          models: updatedModels,
        },
      };
    }),

  removeModel: (key) =>
    set((state) => ({
      specs: {
        ...state.specs,
        models: state.specs.models.filter((model) => model.id !== key),
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
