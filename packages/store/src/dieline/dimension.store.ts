import { create } from "zustand";
import { resolveDimension } from "../utils/dimensionResolver";
import { toPt } from "../../../dieline-core/src/utils/sizeConvertor";

export type DimensionKey = "width" | "length" | "height";

type Dimension = {
  width: number;
  length: number;
  height: number;
};

type Unit = {
  pt: number;
  mm: number;
};

type Resolved = Record<DimensionKey, Unit>;

export type Dimensions = {
  raw: {
    width: number;
    length: number;
    height: number;
  };
  resolved: Resolved;
};

type DimensionStore = {
  dimension: Dimensions;
  setDimension: (key: DimensionKey, value: number) => void;
  setDefaultDimension: (dimension: Dimension) => void;
};

// all units in MM
export const useDimensionStore = create<DimensionStore>((set) => ({
  // used for UI
  dimension: {
    raw: {
      width: 0,
      length: 0,
      height: 0,
    },
    // used for dieline generation
    resolved: {
      width: { pt: 0, mm: 0 },
      length: { mm: 0, pt: 0 },
      height: { mm: 0, pt: 0 },
    },
  },

  setDimension: (key, value) =>
    set((state) => ({
      dimension: {
        raw: {
          ...state.dimension.raw,
          [key]: value,
        },
        resolved: {
          ...state.dimension.resolved,
          [key]: {
            pt: toPt(resolveDimension(key, value)!), //todo: import toPt from correct path
            mm: resolveDimension(key, value),
          },
        },
      },
    })),

  setDefaultDimension: (dimension) =>
    set(() => ({
      dimension: {
        raw: dimension,
        resolved: resolveDimensions(dimension),
      },
    })),
}));

export const getDimension = () => useDimensionStore.getState().dimension;

function resolveDimensions(dimension: Dimension): Resolved {
  const widthResolved = resolveDimension("width", dimension.width)!;
  const lengthResolved = resolveDimension("length", dimension.length)!;
  const heightResolved = resolveDimension("height", dimension.height)!;

  return {
    width: { mm: widthResolved, pt: toPt(widthResolved) },
    length: { mm: lengthResolved, pt: toPt(lengthResolved) },
    height: { mm: heightResolved, pt: toPt(heightResolved) },
  };
}
