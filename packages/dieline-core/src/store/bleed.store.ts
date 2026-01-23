import { create } from "zustand";
import { BLEED } from "../data/consts";

type BleedStore = {
  bleed: number;
  setBleed: (bleed: number) => void;
};

export const useBleedStore = create<BleedStore>((set) => ({
  bleed: BLEED.default,
  setBleed: (bleed) => set(() => ({ bleed })),
}));
