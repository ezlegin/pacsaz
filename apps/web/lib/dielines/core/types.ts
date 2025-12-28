import { IModel } from "makerjs";
import { MaterialKey } from "./consts";
import { DimensionType } from "./helpers/applyDimensionOffset";
import { Watermark } from "./helpers/injectWatermark";

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

export type MaterialValue = {
  value: string;
  label: string;
  color: string;
  thickness: number;
};

export type MaterialsInput = {
  default: MaterialValue;
  included: MaterialValue[];
};

export type SizesProps = {
  width: number;
  height: number;
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
  container: SizesProps;
  trim: SizesProps;
  bleed: SizesProps;
  bleedAmount: number;
  offset: OffsetType;
};

export type Model = {
  model: string;
  sizes: SVGModelSizes;
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

export type DielineModel = (params: {
  developers: {
    showAnchors: boolean;
    showWatermark: boolean;
    showOverallDimensions: boolean;
  };
  dimensions: {
    bleedSize?: number;
    raw: { width: number; height: number; length: number };
    resolved: {
      width: number;
      length: number;
      height?: number;
      offsets: Offsets;
    };
  };
  dimensionType: DimensionType;
  selectedMaterial: MaterialKey;
}) => Model;

export interface DielineGeneratorProps {
  slug: string;
  title: string;
  dimensions: DielineDimensions;
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
  bleed: {
    bleedAmount: number;
  };
  offsets: {
    width: {
      inner: number;
      outer: number;
    };
    length: {
      inner: number;
      outer: number;
    };
  };
  showAnchors: boolean;
  showOverallDimensions: boolean;
  watermark: Watermark;
  material: MaterialKey;
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
