import { create } from "zustand";
import { FormatsType } from "../../../dieline-core/src/data/types";

type FormatStore = {
  format: FormatsType;
  setFormat: (format: FormatsType) => void;
};

export const useFormatStore = create<FormatStore>((set) => ({
  format: "pdf",
  setFormat: (format) => set(() => ({ format })),
}));
