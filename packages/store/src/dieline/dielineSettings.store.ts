import { create } from "zustand";
import { bleeds, materials } from "../data/dieline";
import {
  Dimensions,
  DimensionType,
  Format,
  MaterialValue,
} from "../data/types";

export type DielineSettings = {
  dimension: Dimensions;
  material: MaterialValue;
  bleed: number;
  thickness: number;
  dimensionType: DimensionType;
  format: Format;
};

type DielineSettingsStore = {
  settings: DielineSettings;
  setSetting: <K extends keyof DielineSettings>(
    key: K,
    value: DielineSettings[K]
  ) => void;
  setDefaultSettings: (settings: DielineSettings) => void;
};

export const defaultMaterial = materials["glossy-cardboard"];
export const useDielineSettingsStore = create<DielineSettingsStore>((set) => ({
  settings: {
    dimension: {
      raw: {
        width: 0,
        length: 0,
        height: 0,
      },
      resolved: {
        width: 0,
        length: 0,
        height: 0,
      },
    },
    bleed: bleeds.default,
    dimensionType: "manufacture",
    format: "pdf",
    material: defaultMaterial,
    thickness: defaultMaterial.thickness,
  },

  setSetting: (key, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: value,
      },
    })),

  setDefaultSettings: (settings) =>
    set(() => ({
      settings,
    })),
}));

export const getDielineSettings = () =>
  useDielineSettingsStore.getState().settings;
