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

//! Dimensions ---------------------------------
export type DimensionKey = "width" | "length" | "height";
export type Dimension = Record<DimensionKey, number>;
export type Dimensions = Record<"raw" | "resolved", Dimension>;
