import { create } from "zustand";

export type Format = "ai" | "pdf" | "dxf";

type FormatStore = {
  format: Format;
  setFormat: (format: Format) => void;
};

export const useFormatStore = create<FormatStore>((set) => ({
  format: "pdf",
  setFormat: (format) => set(() => ({ format })),
}));
