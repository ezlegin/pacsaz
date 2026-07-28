import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ISpec } from "../types";
import type { RootState } from "../store";

const shapesAdapter = createEntityAdapter<ISpec.ShapesSpec>();

const shapesSlice = createSlice({
  name: "shapes",
  initialState: shapesAdapter.getInitialState(),
  reducers: {
    addShape: shapesAdapter.addOne,
    addShapes: shapesAdapter.setAll,
    updateShape: shapesAdapter.updateOne,
    removeShape: shapesAdapter.removeOne,
    setShapeVisibility: (state, action: PayloadAction<string>) => {
      const shape = state.entities[action.payload];
      if (shape) shape.hidden = !shape.hidden;
    },
  },
});

export const {
  addShape,
  addShapes,
  setShapeVisibility,
  updateShape,
  removeShape,
} = shapesSlice.actions;

export const shapesSelectors = shapesAdapter.getSelectors(
  (state: RootState) => state.dieline.present.shapes,
);

export default shapesSlice.reducer;
