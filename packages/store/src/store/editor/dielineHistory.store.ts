import { create } from "zustand";
import { ISpec } from "./dielineSpec.store";

interface DielineHistoryState {
  past: ISpec.Shapes[];
  present: ISpec.Shapes | null;
  future: ISpec.Shapes[];

  setInitial: (shapes: ISpec.Shapes) => void;
  push: (shapes: ISpec.Shapes) => void;
  undo: () => void;
  redo: () => void;
}

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

export const useDielineHistoryStore = create<DielineHistoryState>((set) => ({
  past: [],
  present: null,
  future: [],

  setInitial: (shapes) =>
    set({
      past: [],
      present: clone(shapes),
      future: [],
    }),

  push: (shapes) =>
    set((state) => {
      if (!state.present) {
        return { present: clone(shapes) };
      }

      return {
        past: [...state.past, state.present].slice(-10),
        present: clone(shapes),
        future: [], // clear redo stack
      };
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0 || !state.present) return state;

      const previous = state.past[state.past.length - 1];

      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0 || !state.present) return state;

      const next = state.future[0];

      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }),
}));
