import { IModel } from "makerjs";
import { Watermark } from "../core/helpers/injectWatermark";
import { DimensionType } from "../utils/applyDimensionOffset";

export type Dimensions = {
  width: number;
  length: number;
  height: number;
};

export type DimensionKey = "width" | "length" | "height";
export type DimensionsType = ["manufacture"?, "inner"?, "outer"?];
export type FormatsType = "pdf" | "ai" | "dxf";

export type DielineDimensions = {
  defaultDimensions: Dimensions;
  minDimensions: Dimensions;
};

export type MaterialsInput = {
  default: MaterialValue;
  included: MaterialValue[];
};

export type OffsetType = {
  width: {
    inner: number;
    outer: number;
  };
  length: {
    inner: number;
    outer: number;
  };
};

export type SVGModelSizes = {
  offset: OffsetType;
};

export type Offsets = {
  width: {
    inner: number;
    outer: number;
  };
  length: {
    inner: number;
    outer: number;
  };
};

export type ResolvedDimensions = {
  width: number;
  length: number;
  height?: number;
};

export type DielineModel = (params: {
  dimensions: {
    resolved: ResolvedDimensions;
  };
}) => string;

export interface DielineGeneratorProps {
  slug: string;
  title: string;
  dimensions: DielineDimensions;
  defaultBleed?: number;
  dimensionsType: DimensionsType;
  materials: MaterialsInput;
  model: DielineModel;
}

export type OffsetObjectParams = {
  inner: number;
  outer: number;
};

export type OffsetObject = {
  widthOffset: OffsetObjectParams;
  lengthOffset: OffsetObjectParams;
  heightOffset?: OffsetObjectParams;
};

export type ModelExporter = {
  model: IModel;
  trimModel: IModel;
  watermark: Watermark;
};

export type Dust = {
  size: number;
  indent: {
    bl: number;
    tl: number;
    tr: number;
    br: number;
  };
  height: {
    l: number;
    r: {
      inner: number;
      outer: number;
    };
  };
};

export type DielineData = {
  size: Dimensions;
  dimensionType: DimensionType;
  bleedSize: number;
  customThickness: number | undefined;
};

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

export type Material = Record<MaterialKey, MaterialValue>;
