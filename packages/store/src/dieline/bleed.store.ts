import { create } from "zustand";

export const bleeds = {
  sm: 3,
  default: 5, // md
  lg: 7,
  xl: 10,
};

type BleedStore = {
  bleed: number;
  setBleed: (bleed: number | undefined) => void;
};

export const useBleedStore = create<BleedStore>((set) => ({
  bleed: bleeds.default,
  setBleed: (bleed) => set(() => (bleed ? { bleed } : {})),
}));

export const getBleed = () => useBleedStore.getState().bleed;
