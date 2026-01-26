import { create } from "zustand";

type SVGStore = {
  svg: string | null;
  setSvg: (svg: string) => void;
};

export const useSVGStore = create<SVGStore>((set) => ({
  svg: null,
  setSvg: (svg) => set(() => ({ svg })),
}));
