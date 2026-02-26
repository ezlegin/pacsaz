import { create } from "zustand";
import { ShapesKey } from "../dieline/dielineSpec.store";

interface SelectedShapeStore {
  selectedShape: {
    parent: ShapesKey;
    child: string;
  } | null;
  setSelectedShape: (parent: ShapesKey, child: string) => void;
  clearSelection: () => void;
}

export const useSelectShapeStore = create<SelectedShapeStore>((set) => ({
  selectedShape: null,

  setSelectedShape: (parent, child) =>
    set(() => ({
      selectedShape: {
        parent,
        child,
      },
    })),

  clearSelection: () => set(() => ({ selectedShape: null })),
}));
