import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { ActionCreators } from "redux-undo";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUndoRedo = () => {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector((state) => state.dieline.past.length > 0);
  const canRedo = useAppSelector((state) => state.dieline.future.length > 0);

  return {
    canUndo,
    canRedo,
    undo: () => dispatch(ActionCreators.undo()),
    redo: () => dispatch(ActionCreators.redo()),
  };
};
