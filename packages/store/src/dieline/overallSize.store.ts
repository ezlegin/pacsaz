import { IMeasureWithCenter } from "makerjs"; //todo
import { create } from "zustand";

export type OverallSizes = Record<
  "trim" | "container" | "bleed",
  IMeasureWithCenter | null
>;

type OverallSizesStore = {
  overallSizes: OverallSizes;
  setOverallSize: (
    key: keyof OverallSizes,
    size: IMeasureWithCenter | null
  ) => void;
};

export const useOverallSize = create<OverallSizesStore>((set) => ({
  overallSizes: {
    trim: null,
    bleed: null,
    container: null,
  },

  setOverallSize: (key, size) =>
    set((state) => ({
      overallSizes: {
        ...state.overallSizes,
        [key]: size,
      },
    })),
}));

export const setOverallSize = useOverallSize.setState;
export const getOverallSizes = () => useOverallSize.getState().overallSizes;
