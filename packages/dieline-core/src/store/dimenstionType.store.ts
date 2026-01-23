import { create } from "zustand";
import { DimensionType } from "../utils/applyDimensionOffset";

type DimensionTypeStore = {
  dimensionType: DimensionType;
  setDimensionType: (dimensionType: DimensionType) => void;
};

export const useDimensionTypeStore = create<DimensionTypeStore>((set) => ({
  dimensionType: "manufacture",
  setDimensionType: (dimensionType) => set(() => ({ dimensionType })),
}));
