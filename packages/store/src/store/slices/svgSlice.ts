import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { svg: string | null } = { svg: null };

const svgSlice = createSlice({
  name: "svg",
  initialState,
  reducers: {
    setSvg: (state, action: PayloadAction<string>) => {
      state.svg = action.payload;
    },
  },
});

export const { setSvg } = svgSlice.actions;
export default svgSlice.reducer;
