import { create } from "zustand";
import { resolveDimension } from "../utils/dimensionResolver";

export type DimensionKey = "width" | "length" | "height";

type Dimension = {
  width: number;
  length: number;
  height: number;
};

export type Dimensions = Record<
  "raw" | "resolved",
  {
    width: number;
    length: number;
    height: number;
  }
>;

type DimensionStore = {
  dimension: Dimensions;
  setDimension: (key: DimensionKey, value: number) => void;
  setDefaultDimension: (dimension: Dimension) => void;
};

const dimDefaults = {
  width: 0,
  length: 0,
  height: 0,
};

// all units in MM
export const useDimensionStore = create<DimensionStore>((set) => ({
  dimension: {
    raw: dimDefaults, // used for UI
    resolved: dimDefaults, // used for dieline generation
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
          [key]: resolveDimension(key, value),
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

function resolveDimensions(dimension: Dimension): Dimension {
  return {
    width: resolveDimension("width", dimension.width)!,
    length: resolveDimension("length", dimension.length)!,
    height: resolveDimension("height", dimension.height)!,
  };
}
