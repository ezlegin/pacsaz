import { create } from "zustand";
import { bleeds } from "./bleed.store";
import { Dimension } from "./dimension.store";
import { DimensionType } from "./dimensionType.store";
import { Format } from "./format.store";
import { materials, MaterialValue } from "./material.store";

type CTX = {
  bleed: number;
  dimension: {
    raw: Dimension;
  };
  material: MaterialValue;
  customThickness?: number;
  dimensionType: DimensionType;
  format: Format;
};

type ContextStore = {
  ctx: CTX;
  setContext: (ctx: CTX) => void;
};

const defualts: CTX = {
  bleed: bleeds.default,
  dimension: {
    raw: {
      width: 0,
      length: 0,
      height: 0,
    },
  },
  material: materials["glossy-cardboard"],
  customThickness: undefined,
  dimensionType: "manufacture",
  format: "pdf",
};

export const useContextStore = create<ContextStore>((set) => ({
  ctx: defualts,
  setContext: (ctx) => set(() => ({ ctx })),
}));

export const getDielineCTX = () => useContextStore.getState().ctx;
