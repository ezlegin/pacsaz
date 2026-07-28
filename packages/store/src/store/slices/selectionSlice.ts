import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISpec } from "../types";

type Selection = ISpec.ShapesSpec | ISpec.Ruler | ISpec.ModelsSpec;

const initialState: {
  selection: Selection | null;
} = { selection: null };

const svgSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    setSelection: (state, action: PayloadAction<Selection>) => {
      state.selection = action.payload;
    },
    clearSelection: (state) => {
      state.selection = null;
    },
  },
});

export const { setSelection, clearSelection } = svgSlice.actions;
export default svgSlice.reducer;
