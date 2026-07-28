// Plain getState() reads — safe to import in classes, route handlers,
// server components, or anywhere without "use client". No React involved.
import { store } from "./store";
import { shapesSelectors } from "./slices/shapesSlice";
import { modelsSelectors } from "./slices/modelsSlice";
import { rulersSelectors } from "./slices/rulersSlice";
import { effectsSelectors } from "./slices/effectsSlice";
import { variablesSelectors } from "./slices/variablesSlice";

export const getDevCTX = () => store.getState().developerTools;
export const getDielineFile = () => store.getState().dielineFile.file;
export const getDielineSettings = () => store.getState().dielineSettings;
export const getOverallSizes = () => store.getState().overallSizes;
export const getSVG = () => store.getState().svg.svg;

export const getShapes = () => shapesSelectors.selectAll(store.getState());
export const getModels = () => modelsSelectors.selectAll(store.getState());
export const getRulers = () => rulersSelectors.selectAll(store.getState());
export const getEffects = () => effectsSelectors.selectAll(store.getState());
export const getVariables = () =>
  variablesSelectors.selectAll(store.getState());
