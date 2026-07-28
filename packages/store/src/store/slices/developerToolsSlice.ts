import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DeveloperToolsCTX } from "../types";

const initialState: DeveloperToolsCTX = {
  showContainer: true,
  showAnchors: false,
  showWatermark: true,
  doCenterSVG: true,
  dxf: undefined,
};

const developerToolsSlice = createSlice({
  name: "developerTools",
  initialState,
  reducers: {
    setDeveloperTool: (
      state,
      action: PayloadAction<{ key: keyof DeveloperToolsCTX; value: boolean }>,
    ) => {
      (state as any)[action.payload.key] = action.payload.value;
    },
  },
});

export const { setDeveloperTool } = developerToolsSlice.actions;
export default developerToolsSlice.reducer;
