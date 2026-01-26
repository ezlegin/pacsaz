import { toMm } from "../utils/sizeConvertor";
import { calculateSafeFoldOffset } from "../core/helpers/calculate/calculateSafeFoldOffset";
import { Materials } from "@repo/store/data/types";
import { IPoint } from "makerjs";

export const onDevelepe = process.env.NODE_ENV === "development";
export const onProduction = process.env.NODE_ENV === "production";
export const EPS = 0.0001;
export const zero: IPoint = [0, 0];

// GUIDES
export const GUIDES = {
  foldDasharray: [toMm(5), toMm(4)].join(","), // PT
  textFontSizePT: toMm(20).toString(),
};

export const GLUES = {
  sm: 12,
  md: 16,
  lg: 25,
  xl: 35,
  xxl: 50,
};

export const DOOR = {
  tuckFlap: {
    size: (width: number) => {
      if (width >= 180) return 25; // > 180
      if (width >= 130) return 20; // 130 - 179
      if (width >= 100) return 15; // 100 - 129
      if (width >= 60) return 13; // 60 - 99
      return 11; // < 60
    },
    seam: {
      w: 8,
      h: 1.5,
    },
  },
  foldOffset: 1,
};
export type TuckFlap = typeof DOOR.tuckFlap;

export const DIMENSIONS = [
  { key: "length", label: "طول" },
  { key: "width", label: "عرض" },
  { key: "height", label: "ارتفاع" },
] as const;

export const DIMENSIONS_TYPE = [
  { key: "manufacture", label: "ابعاد تولید" },
  { key: "inner", label: "ابعاد داخلی" },
  { key: "outer", label: "ابعاد خارجی" },
] as const;

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
