export type Format = "ai" | "pdf" | "dxf";
export type DimensionType = "manufacture" | "inner" | "outer";

//! Materils ---------------------------------
export type MaterialKey =
  | "cFlute"
  | "beFlute"
  | "bcFlute"
  | "abFlute"
  | "artPaper"
  | "glossyCardboard"
  | "fFlute"
  | "eFlute"
  | "bFlute";
export type MaterialValue = {
  value: MaterialKey;
  label: string;
  thickness: number;
  offset: {
    inner: number;
    outer: number;
  };
};
export type Materials = Record<MaterialKey, MaterialValue>;

//! ISpec — shapes / models / rulers --------------------------------------
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
    isRelative: boolean;
  } & Generals & { type: "lines" };

  export type RectangleSpec = Record<"width" | "height", string> & {
    deleteSide?: Direction;
  } & Generals & { type: "rectangle" };

  export type CircleSpec = {
    radius: string;
    radiusX: string;
    radiusY: string;
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

  export type Specs = {
    shapes: ISpec.Shapes;
    models: ISpec.Models;
    rulers: ISpec.Rulers;
  };
}

//! IEffect ----------------------------------------------------------------
export namespace IEffect {
  export type RadiusType = "full" | "indices";
  export type EffectOn = "shape" | "effect";
  export type EffectTypes = "boolean" | "radius";
  export type BooleanType = "union" | "subtract" | "intersect";
  type ModelId = string;

  interface EffectBase {
    id: string;
    hidden?: boolean;
    key: string;
    effectOn: EffectOn;
  }

  export interface BooleanEffectSpec extends EffectBase {
    type: "boolean";
    booleanType: BooleanType;
    targetModelId: ModelId;
    originModelId: ModelId;
  }

  export interface RadiusEffectSpec extends EffectBase {
    type: "radius";
    targetModelId: ModelId;
    radius: number;
    indices: { indice: string; radius: string }[];
  }

  export type EffectSpec = BooleanEffectSpec | RadiusEffectSpec;
  export type EffectsMap = EffectSpec[];
}

//! IVar -------------------------------------------------------------------
export namespace IVar {
  export type Variable = {
    id: string;
    name: string;
    conditions?: { if: string; then: string }[];
    value: string;
  };

  export type VariableMap = Variable[];
}

//! Developer tools ---------------------------------------------------------
export type DeveloperToolsCTX = {
  showContainer: boolean;
  showAnchors: boolean;
  showWatermark: boolean;
  doCenterSVG: boolean;
  dxf: string | undefined;
};

//! Dieline settings ----------------------------------------------------------
export type DimensionKey = "width" | "length" | "height";
export type Dimension = Record<DimensionKey, number>;
export type Dimensions = Record<"raw" | "resolved", Dimension>;
export type DielineSettings = {
  dimension: Dimensions;
  minDimension: Dimension;
  material: MaterialValue;
  materials: MaterialValue[];
  bleed: number;
  thickness: number;
  dimensionType: DimensionType;
  dimensionTypes: DimensionType[];
  format: Format;
  showOverallRulers: boolean;
};

//! Overall sizes -------------------------------------------------------------
export type SizeDimension = Record<"width" | "height", number>;
export type OverallSizes = Record<
  "trim" | "container" | "bleed",
  SizeDimension | null
>;
