import { create } from "zustand";
import { ISpec } from "../dieline/dielineSpec.store";

interface SelectedShapeStore {
  selectedShape: ISpec.ShapesSpec | null;
  setSelectedShape: (selectedShape: ISpec.ShapesSpec) => void;
  clearSelection: () => void;
}

export const useSelectShapeStore = create<SelectedShapeStore>((set) => ({
  selectedShape: null,

  setSelectedShape: (selectedShape) =>
    set(() => ({
      selectedShape,
    })),

  clearSelection: () => set(() => ({ selectedShape: null })),
}));
