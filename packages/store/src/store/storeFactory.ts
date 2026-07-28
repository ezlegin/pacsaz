import { combineReducers, configureStore } from "@reduxjs/toolkit";
import undoable, { excludeAction } from "redux-undo";

import developerToolsReducer from "./slices/developerToolsSlice";
import dielineFileReducer from "./slices/dielineFileSlice";
import dielineSettingsReducer from "./slices/dielineSettingsSlice";
import overallSizesReducer from "./slices/overallSizesSlice";
import svgReducer from "./slices/svgSlice";
import shapesReducer from "./slices/shapesSlice";
import modelsReducer from "./slices/modelsSlice";
import rulersReducer from "./slices/rulersSlice";
import effectsReducer from "./slices/effectsSlice";
import variablesReducer from "./slices/variablesSlice";

/**
 * Use this (instead of the shared `store` in index.ts) for any server-side
 * work that is request-scoped — e.g. a route handler that builds/processes
 * a dieline from request-specific input. `store` in index.ts is a
 * module-level singleton, so on a long-lived server process it would be
 * shared across every concurrent request. This factory gives each request
 * its own isolated store instance.
 */
export function createDielineStore(preloadedState?: Record<string, unknown>) {
  const undoableReducer = undoable(
    combineReducers({
      shapes: shapesReducer,
      models: modelsReducer,
      rulers: rulersReducer,
      effects: effectsReducer,
      variables: variablesReducer,
    }),
    {
      limit: 50,
      filter: excludeAction([
        "shapes/setShapeVisibility",
        "models/setModelVisibility",
        "rulers/setRulerVisibility",
      ]),
    },
  );

  const rootReducer = combineReducers({
    developerTools: developerToolsReducer, // no persist in a request-scoped store
    dielineFile: dielineFileReducer,
    dielineSettings: dielineSettingsReducer,
    overallSizes: overallSizesReducer,
    svg: svgReducer,
    dieline: undoableReducer,
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type DielineStore = ReturnType<typeof createDielineStore>;
