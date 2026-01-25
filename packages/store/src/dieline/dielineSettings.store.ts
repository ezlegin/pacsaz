import { create } from "zustand";
import { Dimension } from "./dimension.store";
import { DimensionType } from "./dimensionType.store";
import { Format } from "./format.store";
import { MaterialValue } from "./material.store";

export type DielineSettings = {
  dimension: { raw: Dimension };
  material: MaterialValue;
  bleed: number;
  customThickness: number;
  dimensionType: DimensionType;
  format: Format;
};

type DielineSettingsStore = {
  settings: Partial<DielineSettings>;
  setSetting: <K extends keyof DielineSettings>(
    key: K,
    value: DielineSettings[K]
  ) => void;
  setDefaultSettings: (settings: DielineSettings) => void;
};

export const useDielineSettings = create<DielineSettingsStore>((set) => ({
  settings: {},

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
