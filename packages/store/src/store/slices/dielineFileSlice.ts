import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { file: string } = { file: "" };

const dielineFileSlice = createSlice({
  name: "dielineFile",
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<string>) => {
      state.file = action.payload;
    },
  },
});

export const { setFile } = dielineFileSlice.actions;
export default dielineFileSlice.reducer;
