"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { EditorState, EditorStore } from "./store";

const StoreContext = createContext<EditorStore | null>(null);

export function EditorProvider({ store, children }: { store: EditorStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): EditorStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <EditorProvider>");
  return store;
}

/**
 * Subscribes to one slice of the editor state. The selector must return a value
 * that is stable while the slice is unchanged (a field of the state, not a new
 * object), or React will re-render forever.
 */
export function useEditor<T>(selector: (state: EditorState) => T): T {
  const store = useStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get()),
  );
}
