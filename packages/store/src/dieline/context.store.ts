import { create } from "zustand";
import { bleeds } from "./bleed.store";
import {
  Dimensions,
  FormatsType,
  MaterialValue,
} from "../../../dieline-core/src/data/types";
import { materials } from "./material.store";
import { DimensionType } from "../../../dieline-core/src/utils/applyDimensionOffset";

type CTX = {
  bleed: number;
  dimension: Dimensions;
  material: MaterialValue;
  thickness: number;
  customThickness?: number;
  dimensionType: DimensionType;
  format: FormatsType;
};

type ContextStore = {
  ctx: CTX;
  setContext: (ctx: CTX) => void;
};

const defualts: CTX = {
  bleed: bleeds.default,
  dimension: {
    width: 0,
    length: 0,
    height: -1,
  },
  material: materials["glossy-cardboard"],
  thickness: materials["glossy-cardboard"].thickness,
  customThickness: undefined,
  dimensionType: "manufacture",
  format: "pdf",
};

export const useContextStore = create<ContextStore>((set) => ({
  ctx: defualts,
  setContext: (ctx) => set(() => ({ ctx })),
}));

export const getDielineCTX = () => useContextStore.getState().ctx;
