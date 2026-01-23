import { create } from "zustand";
import { MaterialValue } from "../../../dieline-core/src/data/types";
import { getThicknessRange } from "../utils/getThicknessRange";

type ThicknessStore = {
  thickness: number;
  setThickness: (thickness: number) => void;
  customThickness?: number;
  setCustomThickness: (customThickness: number | undefined) => void;
  getThicknessRange: (materialsIncluded: MaterialValue[]) => {
    min: number;
    max: number;
  };
};

export const useThicknessStore = create<ThicknessStore>((set) => ({
  thickness: 0,
  customThickness: undefined,
  setThickness: (thickness) => set(() => ({ thickness })),
  setCustomThickness: (customThickness) => set(() => ({ customThickness })),
  getThicknessRange: (materialsIncluded) =>
    getThicknessRange(materialsIncluded),
}));
