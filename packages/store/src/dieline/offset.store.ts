import { create } from "zustand";

type OffsetKey = "width" | "length" | "height";
export type OffsetVal = { inner: number; outer: number };

export type Offset = Record<OffsetKey, OffsetVal>;

type OffsetStore = {
  offset: Offset | null;
  setOffset: (offset: Offset) => void;
};

export const useOffsetStore = create<OffsetStore>((set) => ({
  offset: null,

  setOffset: (offset) => set(() => ({ offset })),
}));

export const setOffset = useOffsetStore.setState;
export const getOffset = () => useOffsetStore.getState().offset;
