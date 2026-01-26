import { create } from "zustand";

type Dimension = Record<"width" | "height", number>;

export type OverallSizes = Record<
  "trim" | "container" | "bleed",
  Dimension | null
>;

type OverallSizesStore = {
  overallSizes: OverallSizes;
  setOverallSize: (key: keyof OverallSizes, size: Dimension | null) => void;
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
