import { combineReducers, configureStore } from "@reduxjs/toolkit";
import undoable, { excludeAction } from "redux-undo";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import developerToolsReducer from "./slices/developerToolsSlice";
import dielineFileReducer from "./slices/dielineFileSlice";
import dielineSettingsReducer from "./slices/dielineSettingsSlice";
import overallSizesReducer from "./slices/overallSizesSlice";
import svgReducer from "./slices/svgSlice";
import selectionReducer from "./slices/selectionSlice";
import nodesReducer from "./slices/nodesSlice";
import rulersReducer from "./slices/rulersSlice";
import variablesReducer from "./slices/variablesSlice";

const undoableReducer = undoable(
  combineReducers({
    nodes: nodesReducer,
    rulers: rulersReducer,
    variables: variablesReducer,
  }),
  {
    limit: 20,
    filter: excludeAction([
      "nodes/setNodeVisibility",
      "rulers/setRulerVisibility",
    ]),
  },
);

const rootReducer = combineReducers({
  developerTools: developerToolsReducer,
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
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
