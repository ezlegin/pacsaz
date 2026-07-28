import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ISpec } from "../types";
import type { RootState } from "../store";

const modelsAdapter = createEntityAdapter<ISpec.ModelsSpec>();

const modelsSlice = createSlice({
  name: "models",
  initialState: modelsAdapter.getInitialState(),
  reducers: {
    addModel: modelsAdapter.addOne,
    addModels: modelsAdapter.setAll,
    updateModel: modelsAdapter.updateOne,
    removeModel: modelsAdapter.removeOne,
    setModelVisibility: (state, action: PayloadAction<string>) => {
      const model = state.entities[action.payload];
      if (model) model.hidden = !model.hidden;
    },
  },
});

export const {
  addModel,
  addModels,
  setModelVisibility,
  updateModel,
  removeModel,
} = modelsSlice.actions;

export const modelsSelectors = modelsAdapter.getSelectors(
  (state: RootState) => state.dieline.present.models,
);

export default modelsSlice.reducer;
