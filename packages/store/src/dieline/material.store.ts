import { create } from "zustand";

export type MaterialKey =
  | "c-flute"
  | "be-flute"
  | "bc-flute"
  | "ab-flute"
  | "art-paper"
  | "glossy-cardboard"
  | "f-flute"
  | "e-flute"
  | "b-flute";

export type MaterialValue = {
  value: MaterialKey;
  label: string;
  thickness: number;
  safeFoldOffset: number;
  offset: {
    inner: number;
    outer: number;
  };
};

export type Material = Record<MaterialKey, MaterialValue>;

export const materials: Material = {
  "glossy-cardboard": {
    value: "glossy-cardboard",
    label: "مقوا گلاسه",
    thickness: 0.5,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 2,
        outer: this.thickness,
      };
    },
  },
  "f-flute": {
    value: "f-flute",
    label: "کارتن فلوت F",
    thickness: 1.2,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 2,
        outer: this.thickness,
      };
    },
  },
  "e-flute": {
    value: "e-flute",
    label: "کارتن فلوت E",
    thickness: 2,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 2,
        outer: this.thickness,
      };
    },
  },
  "b-flute": {
    value: "b-flute",
    label: "کارتن فلوت B",
    thickness: 3,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 3,
        outer: this.thickness,
      };
    },
  },
  "c-flute": {
    value: "c-flute",
    label: "کارتن فلوت C",
    thickness: 4,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  "be-flute": {
    value: "be-flute",
    label: "کارتن فلوت BE",
    thickness: 5,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  "bc-flute": {
    value: "bc-flute",
    label: "کارتن فلوت BC",
    thickness: 7,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  "ab-flute": {
    value: "ab-flute",
    label: "کارتن فلوت AB",
    thickness: 7,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  "art-paper": {
    value: "art-paper",
    label: "کاغذ گلاسه",
    thickness: 0.2,
    get safeFoldOffset() {
      return calculateSafeFoldOffset(this.thickness);
    },
    get offset() {
      return {
        inner: 1.5,
        outer: this.thickness,
      };
    },
  },
};

function calculateSafeFoldOffset(materialThickness: number) {
  if (materialThickness <= 1.5) return materialThickness; // 0 - 1.5

  if (materialThickness < 3) return 1.5; // 1.6 - 2.9

  if (materialThickness < 4) return 2; // 3 - 3.9

  if (materialThickness < 5) return 3.5; // 4 - 4.9

  if (materialThickness < 6) return 4; // 5 - 5.9

  if (materialThickness >= 6) return 5; // 5 - 5.9

  return materialThickness;
}

type MaterialStore = {
  materials: Material;
  material: MaterialValue;
  setMaterial: (key: MaterialKey) => void;
};

export const useMaterialStore = create<MaterialStore>((set) => ({
  materials,
  material: materials["glossy-cardboard"],

  setMaterial: (key) =>
    set((state) => ({
      material: state.materials[key],
    })),
}));
