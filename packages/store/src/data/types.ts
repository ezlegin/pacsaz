export type Format = "ai" | "pdf" | "dxf";
export type DimensionType = "manufacture" | "inner" | "outer";

//! Materils ---------------------------------
export type MaterialKey =
  | "c-flute"
  | "be-flute"
  | "bc-flute"
  | "ab-flute"
  | "art-paper"
  | "glossy-cardboard"
  | "f-flute"
  | "e-flute"
  | "b-flute";
export type MaterialValue = {
  value: MaterialKey;
  label: string;
  thickness: number;
  safeFoldOffset: number;
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
