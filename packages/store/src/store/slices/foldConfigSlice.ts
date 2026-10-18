import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Authored fold overrides for the template being edited, held as JSON.
 *
 * Stored as an opaque string on purpose: the fold schema belongs to
 * `@repo/dieline-3d`, and keeping it out of the store means the shared store
 * takes no dependency on the 3D stack. The editor parses, edits and re-serialises
 * with that package's helpers.
 *
 * `""` means nothing authored yet — the viewer falls back to its inference.
 */
type FoldConfigState = {
  json: string;
  /** Face count when last loaded, so template drift can be detected. */
  faceCount: number;
  /** Bumped on every edit so consumers can re-render cheaply. */
  revision: number;
};

const initialState: FoldConfigState = {
  json: "",
  faceCount: 0,
  revision: 0,
};

const foldConfigSlice = createSlice({
  name: "foldConfig",
  initialState,
  reducers: {
    loadFoldConfig: (
      state,
      action: PayloadAction<{ json: string; faceCount?: number }>,
    ) => {
      state.json = action.payload.json ?? "";
      state.faceCount = action.payload.faceCount ?? 0;
      state.revision += 1;
    },

    setFoldConfigJson: (state, action: PayloadAction<string>) => {
      state.json = action.payload;
      state.revision += 1;
    },

    setFoldConfigFaceCount: (state, action: PayloadAction<number>) => {
      state.faceCount = action.payload;
    },

    resetFoldConfig: (state) => {
      state.json = "";
      state.revision += 1;
    },
  },
});

export const {
  loadFoldConfig,
  setFoldConfigJson,
  setFoldConfigFaceCount,
  resetFoldConfig,
} = foldConfigSlice.actions;

export const foldConfigSelectors = {
  json: (state: { foldConfig: FoldConfigState }) => state.foldConfig.json,
  faceCount: (state: { foldConfig: FoldConfigState }) =>
    state.foldConfig.faceCount,
  revision: (state: { foldConfig: FoldConfigState }) =>
    state.foldConfig.revision,
};

export default foldConfigSlice.reducer;
