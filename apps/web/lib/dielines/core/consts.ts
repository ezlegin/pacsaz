import { aiIcon, dxfIcon, pdfIcon } from "@/public";
import { toPt } from "../../../utils/sizeConvertor";

export const onDevelepe = process.env.NODE_ENV === "development";
export const onProduction = process.env.NODE_ENV === "production";

// COLORS
export const COLORS = {
  dielines: {
    bleed: "green",
    trim: "blue",
    fold: "red",
    fill: "white",
  },

  guides: {
    box: "white",
    line: "#1E90FF", // dodgerBlue
    text: "#1E90FF", // dodgerBlue
  },
};

// GUIDES
export const GUIDES = {
  foldDasharray: "5,2", // PT
  textFontSizePT: 12,
};

export const GLUES = {
  sm: 16,
};

//  BLEED
export const BLEED = {
  default: 3,
  md: 5,
  lg: 7,
  xl: 10,
};

export const zero = [0, 0];

export const MARGINS = {
  container: 40,
};

export const DimensionsTypeOffset = toPt(1.4);

export const DIMENSIONS = [
  { key: "length", label: "طول" },
  { key: "width", label: "عرض" },
  { key: "height", label: "ارتفاع" },
] as const;

export const FORMATS = [
  { value: "pdf", icon: pdfIcon },
  { value: "ai", icon: aiIcon },
  { value: "dxf", icon: dxfIcon },
] as const;

export const DIMENSIONS_TYPE = [
  { key: "manufacture", label: "ابعاد تولید" },
  { key: "inner", label: "ابعاد داخلی" },
  { key: "outer", label: "ابعاد خارجی" },
] as const;

export const MATERIALS = {
  "glossy-cardboard": {
    value: "glossy-cardboard",
    label: "مقوا گلاسه",
    color: "bg-white",
    thickness: 0.4,
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
    color: "bg-orange-100/70",
    thickness: 1.2,
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
    color: "bg-orange-100",
    thickness: 2,
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
    color: "bg-orange-200",
    thickness: 3,
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
    color: "bg-orange-300",
    thickness: 4,
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
    color: "bg-orange-400",
    thickness: 5,
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
    color: "bg-orange-500",
    thickness: 7,
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
    color: "bg-orange-500",
    thickness: 7,
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
    color: "bg-white",
    thickness: 0.2,
    get offset() {
      return {
        inner: 1.5,
        outer: this.thickness,
      };
    },
  },
} as const;

export type MaterialKey = keyof typeof MATERIALS;
