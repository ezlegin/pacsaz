import { create } from "zustand";
import { Model } from "../../../dieline-core/src/data/types";

type SVGStore = {
  svg: Model | null;
  setSvg: (svg: Model) => void;
};

export const useSVGStore = create<SVGStore>((set) => ({
  svg: null,
  setSvg: (svg) => set(() => ({ svg })),
}));
