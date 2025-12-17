import { aiIcon, dxfIcon, pdfIcon } from "@/public";
import { mmToPt } from "../../../utils/sizeConvertor";

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
export const GUIDS = {
  foldDasharray: "5,2", // PT
  textFontSizePT: 12,
};

//  BLEED
export const BLEED = {
  default: {
    mm: 3,
    pt: mmToPt(3),
  },
  md: {
    mm: 5,
    pt: mmToPt(5),
  },
  lg: {
    mm: 7,
    pt: mmToPt(7),
  },
  xl: {
    mm: 10,
    pt: mmToPt(10),
  },
};

export const MARGINS = {
  container: 40,
};

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
  cardboard: {
    value: "cardboard",
    label: "مقوا گلاسه",
    color: "bg-white",
    thicknessMM: 0.4,
  },
  "f-flute": {
    value: "f-flute",
    label: "کارتن فلوت F",
    color: "bg-orange-100/70",
    thicknessMM: 1.2,
  },
  "e-flute": {
    value: "e-flute",
    label: "کارتن فلوت E",
    color: "bg-orange-100",
    thicknessMM: 2,
  },
  "b-flute": {
    value: "b-flute",
    label: "کارتن فلوت B",
    color: "bg-orange-200",
    thicknessMM: 3,
  },
  "c-flute": {
    value: "c-flute",
    label: "کارتن فلوت C",
    color: "bg-orange-300",
    thicknessMM: 4,
  },
  "be-flute": {
    value: "be-flute",
    label: "کارتن فلوت BE",
    color: "bg-orange-400",
    thicknessMM: 5,
  },
  "bc-flute": {
    value: "bc-flute",
    label: "کارتن فلوت BC",
    color: "bg-orange-500",
    thicknessMM: 7,
  },
  "ab-flute": {
    value: "ab-flute",
    label: "کارتن فلوت AB",
    color: "bg-orange-500",
    thicknessMM: 7,
  },
  "art-paper": {
    value: "art-paper",
    label: "کاغذ گلاسه",
    color: "bg-white",
    thicknessMM: 0.2,
  },
};
