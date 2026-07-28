import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ISpec } from "../types";
import type { RootState } from "../store";

const rulersAdapter = createEntityAdapter<ISpec.Ruler>();

const rulersSlice = createSlice({
  name: "rulers",
  initialState: rulersAdapter.getInitialState(),
  reducers: {
    addRuler: rulersAdapter.addOne,
    addRulers: rulersAdapter.setAll,
    updateRuler: rulersAdapter.updateOne,
    removeRuler: rulersAdapter.removeOne,

    setRulerVisibility: (state, action: PayloadAction<string>) => {
      const ruler = state.entities[action.payload];
      if (ruler) ruler.hidden = !ruler.hidden;
    },
  },
});

export const {
  addRuler,
  addRulers,
  updateRuler,
  removeRuler,
  setRulerVisibility,
} = rulersSlice.actions;

export const rulersSelectors = rulersAdapter.getSelectors(
  (state: RootState) => state.dieline.present.rulers,
);

export default rulersSlice.reducer;
