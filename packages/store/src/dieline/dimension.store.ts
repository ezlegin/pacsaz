import { create } from "zustand";

type DimensionKey = "width" | "length" | "height";

type Dimension = {
  width: number;
  length: number;
  height: number;
};

type DimensionStore = {
  dimension: Dimension;
  setDimension: (key: DimensionKey, value: number) => void;
  setDefaultDimension: (dimension: Dimension) => void;
};

export const useDimensionStore = create<DimensionStore>((set) => ({
  dimension: {
    width: 0,
    length: 0,
    height: 0,
  },

  setDimension: (key, value) =>
    set((state) => ({
      dimension: {
        ...state.dimension,
        [key]: value,
      },
    })),

  setDefaultDimension: (dimension) =>
    set(() => ({
      dimension,
    })),
}));

export const getDimension = () => useDimensionStore.getState().dimension;
