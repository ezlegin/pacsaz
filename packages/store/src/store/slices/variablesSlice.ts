import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { IVar } from "../types";

const variablesAdapter = createEntityAdapter<IVar.Variable>();

const variablesSlice = createSlice({
  name: "variables",
  initialState: variablesAdapter.getInitialState(),
  reducers: {
    addVariable: variablesAdapter.addOne,
    addVariables: variablesAdapter.setAll,
    updateVariable: variablesAdapter.updateOne,
    removeVariable: variablesAdapter.removeOne,
  },
});

export const { addVariable, addVariables, updateVariable, removeVariable } =
  variablesSlice.actions;

export const variablesSelectors = variablesAdapter.getSelectors(
  (state: RootState) => state.dieline.present.variables,
);

export default variablesSlice.reducer;
