import { create } from "zustand";

export type DimensionType = "manufacture" | "inner" | "outer";

type DimensionTypeStore = {
  dimensionType: DimensionType;
  setDimensionType: (dimensionType: DimensionType) => void;
};

export const useDimensionTypeStore = create<DimensionTypeStore>((set) => ({
  dimensionType: "manufacture",
  setDimensionType: (dimensionType) => set(() => ({ dimensionType })),
}));
