import { MaterialKey } from "./consts";
import { DimensionType } from "./helpers/applyDimensionOffset";
import M from "makerjs";
import { ConnectorLine } from "./helpers/bleedGenerator";

export type Dimensions = {
  width: number;
  length: number;
  height: number;
};

export type DimensionKey = "width" | "length" | "height";
export type DimensionsType = ["manufacture"?, "inner"?, "outer"?];
export type FormatsType = "pdf" | "ai" | "dxf";

export type DielineDimensions = {
  initialScale?: number;
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
  };
  dimensions: {
    raw: { width: number; height: number; length: number };
    resolved: {
      width: number;
      length: number;
      height?: number;
      offsets: Offsets;
    };
  };
  dimensionType: DimensionType;
  selectedMaterial?: MaterialKey;
}) => Model;

export interface DielineDefinition {
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
  model: M.IModel;
  trim: M.IModel;
  container: M.IModel;
  bleed: {
    bleedAmount: number;
    connectorLine: ConnectorLine;
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
};
