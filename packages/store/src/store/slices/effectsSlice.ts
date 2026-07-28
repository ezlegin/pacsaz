import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { IEffect } from "../types";

const effectsAdapter = createEntityAdapter<IEffect.EffectSpec>();

const effectsSlice = createSlice({
  name: "effects",
  initialState: effectsAdapter.getInitialState(),
  reducers: {
    addEffect: effectsAdapter.addOne,
    addEffects: effectsAdapter.setAll,
    updateEffect: effectsAdapter.updateOne,
    removeEffect: effectsAdapter.removeOne,
  },
});

export const { addEffect, addEffects, updateEffect, removeEffect } =
  effectsSlice.actions;

export const effectsSelectors = effectsAdapter.getSelectors(
  (state: RootState) => state.dieline.present.effects,
);

export default effectsSlice.reducer;
