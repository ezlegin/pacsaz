import { calculateSafeFoldOffset } from "../utils/calculateSafeFoldOffset";
import { Materials } from "./types";

export const bleeds = {
  sm: 3,
  default: 5, // md
  lg: 7,
  xl: 10,
};

export const materials: Materials = {
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
