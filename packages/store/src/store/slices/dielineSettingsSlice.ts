import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MaterialValue, DielineSettings } from "../types";

export const defaultMaterial: MaterialValue = {
  thickness: 0,
  label: "",
  offset: { inner: 0, outer: 0 },
  value: "glossyCardboard",
};

const initialState: DielineSettings = {
  dimension: {
    raw: { width: 0, length: 0, height: 0 },
    resolved: { width: 0, length: 0, height: 0 },
  },
  minDimension: { width: 0, length: 0, height: 0 },
  dimensionTypes: [],
  bleed: 0,
  dimensionType: "manufacture",
  format: "pdf",
  material: defaultMaterial,
  materials: [defaultMaterial],
  thickness: defaultMaterial.thickness,
  showOverallRulers: false,
};

const dielineSettingsSlice = createSlice({
  name: "dielineSettings",
  initialState,
  reducers: {
    setSetting: (
      state,
      action: PayloadAction<{
        key: keyof DielineSettings;
        value: DielineSettings[keyof DielineSettings];
      }>,
    ) => {
      (state as any)[action.payload.key] = action.payload.value;
    },
    setDefaultSettings: (_state, action: PayloadAction<DielineSettings>) => {
      return action.payload;
    },
  },
});

export const { setSetting, setDefaultSettings } = dielineSettingsSlice.actions;
export default dielineSettingsSlice.reducer;
