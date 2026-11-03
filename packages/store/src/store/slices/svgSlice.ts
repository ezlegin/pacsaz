import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * `svg` is the on-screen drawing; `fold` is the layered SVG the 3D viewer folds.
 * The legacy renderer used one SVG for both; the engine writes them separately.
 */
const initialState: { svg: string | null; fold: string | null } = { svg: null, fold: null };

const svgSlice = createSlice({
  name: "svg",
  initialState,
  reducers: {
    setSvg: (state, action: PayloadAction<string>) => {
      state.svg = action.payload;
    },
    setFoldSvg: (state, action: PayloadAction<string | null>) => {
      state.fold = action.payload;
    },
  },
});

export const { setSvg, setFoldSvg } = svgSlice.actions;
export default svgSlice.reducer;
