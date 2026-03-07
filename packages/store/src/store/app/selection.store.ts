import { create } from "zustand";
import { ISpec } from "../editor/dielineSpec.store";

interface SelectedShapeStore {
  selection: ISpec.ShapesSpec | ISpec.Ruler | ISpec.ModelsSpec | null;
  setSelection: (
    selection: ISpec.ShapesSpec | ISpec.ModelsSpec | ISpec.Ruler,
  ) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectedShapeStore>((set) => ({
  selection: null,

  setSelection: (selection) =>
    set(() => ({
      selection,
    })),

  clearSelection: () => set(() => ({ selection: null })),
}));
