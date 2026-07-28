import {
  createListenerMiddleware,
  isAnyOf,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store";
import { effectsSelectors, removeEffect } from "../slices/effectsSlice";
import { removeShape } from "../slices/shapesSlice";

export const cascadeListenerMiddleware = createListenerMiddleware();

const startAppListening = cascadeListenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();

startAppListening({
  matcher: isAnyOf(removeShape),
  effect: (action: PayloadAction<string>, listenerApi) => {
    const removedId = action.payload;
    const state = listenerApi.getState();

    const staleEffectIds = effectsSelectors
      .selectAll(state)
      .filter((e) => {
        const referencesTarget = e.targetModelId === removedId;
        const referencesOrigin =
          e.type === "boolean" && e.originModelId === removedId;
        return referencesTarget || referencesOrigin;
      })
      .map((e) => e.id);

    staleEffectIds.forEach((id) => listenerApi.dispatch(removeEffect(id)));
  },
});
