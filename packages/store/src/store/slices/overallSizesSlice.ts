// slices/overallSizesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OverallSizes, SizeDimension } from "../types";

const initialState: OverallSizes = {
  trim: null,
  bleed: null,
  container: null,
};

const overallSizesSlice = createSlice({
  name: "overallSizes",
  initialState,
  reducers: {
    setOverallSize: (
      state,
      action: PayloadAction<{
        key: keyof OverallSizes;
        size: SizeDimension | null;
      }>,
    ) => {
      state[action.payload.key] = action.payload.size;
    },
    setOverallSizes: (_state, action: PayloadAction<OverallSizes>) => {
      return action.payload;
    },
  },
});

export const { setOverallSize, setOverallSizes } = overallSizesSlice.actions;
export default overallSizesSlice.reducer;
