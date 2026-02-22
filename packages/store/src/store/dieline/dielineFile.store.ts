import { create } from "zustand";

type SVGStore = {
  file: string;
  setFile: (file: string) => void;
};

export const useDielineFileStore = create<SVGStore>((set) => ({
  file: "",
  setFile: (file) => set(() => ({ file })),
}));

export const setDielineFile = useDielineFileStore.setState;
export const getDielineFile = () => useDielineFileStore.getState();
