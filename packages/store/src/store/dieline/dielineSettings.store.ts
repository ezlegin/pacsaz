import { create } from "zustand";
import { materials } from "../../data/dieline";
import {
  Dimension,
  Dimensions,
  DimensionType,
  Format,
  MaterialValue,
} from "../../data/types";

export type DielineSettings = {
  dimension: Dimensions;
  minDimension: Dimension;
  material: MaterialValue;
  materials: MaterialValue[];
  bleed: number;
  thickness: number;
  dimensionType: DimensionType;
  dimensionTypes: DimensionType[];
  format: Format;
  showOverallRulers: boolean;
};

type DielineSettingsStore = {
  settings: DielineSettings;
  setSetting: <K extends keyof DielineSettings>(
    key: K,
    value: DielineSettings[K],
  ) => void;
  setDefaultSettings: (settings: DielineSettings) => void;
};

export const defaultMaterial = materials[0]!;
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
    minDimension: {
      width: 0,
      length: 0,
      height: 0,
    },
    dimensionTypes: [],
    bleed: 0,
    dimensionType: "manufacture",
    format: "pdf",
    material: defaultMaterial,
    materials: [defaultMaterial],
    thickness: defaultMaterial.thickness,
    showOverallRulers: false,
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
