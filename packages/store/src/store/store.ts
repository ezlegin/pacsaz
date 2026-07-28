import { combineReducers, configureStore } from "@reduxjs/toolkit";
import undoable, { excludeAction } from "redux-undo";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import developerToolsReducer from "./slices/developerToolsSlice";
import dielineFileReducer from "./slices/dielineFileSlice";
import dielineSettingsReducer from "./slices/dielineSettingsSlice";
import overallSizesReducer from "./slices/overallSizesSlice";
import svgReducer from "./slices/svgSlice";
import selectionReducer from "./slices/selectionSlice";
import shapesReducer from "./slices/shapesSlice";
import modelsReducer from "./slices/modelsSlice";
import rulersReducer from "./slices/rulersSlice";
import effectsReducer from "./slices/effectsSlice";
import variablesReducer from "./slices/variablesSlice";
import { cascadeListenerMiddleware } from "./listeners/cascadeListeners";

const persistedDeveloperTools = persistReducer(
  {
    key: "developer-tools",
    storage,
  },
  developerToolsReducer,
);

const undoableReducer = undoable(
  combineReducers({
    shapes: shapesReducer,
    models: modelsReducer,
    rulers: rulersReducer,
    effects: effectsReducer,
    variables: variablesReducer,
  }),
  {
    limit: 20,
    filter: excludeAction([
      "shapes/setShapeVisibility",
      "models/setModelVisibility",
      "rulers/setRulerVisibility",
    ]),
  },
);

const rootReducer = combineReducers({
  developerTools: persistedDeveloperTools,
  dielineFile: dielineFileReducer,
  dielineSettings: dielineSettingsReducer,
  overallSizes: overallSizesReducer,
  svg: svgReducer,
  selection: selectionReducer,
  dieline: undoableReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(cascadeListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
