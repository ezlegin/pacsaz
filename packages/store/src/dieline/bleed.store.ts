import { create } from "zustand";

export const bleed = {
  sm: 3,
  default: 5, // md
  lg: 7,
  xl: 10,
};

type BleedStore = {
  bleed: number;
  setBleed: (bleed: number) => void;
};

export const useBleedStore = create<BleedStore>((set) => ({
  bleed: bleed.default,
  setBleed: (bleed) => set(() => ({ bleed })),
}));
