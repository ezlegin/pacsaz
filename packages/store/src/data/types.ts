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
export type DimensionUnit = {
  pt: number;
  mm: number;
};
export type Resolved = Record<DimensionKey, DimensionUnit>;
export type DimensionKey = "width" | "length" | "height";
export type Dimension = {
  width: number;
  length: number;
  height: number;
};
export type Dimensions = {
  raw: {
    width: number;
    length: number;
    height: number;
  };
  resolved: Resolved;
};
