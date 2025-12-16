import { aiIcon, dxfIcon, pdfIcon } from "@/public";
import { mmToPt } from "./helpers/sizeConvertor";

// COLORS
export const colors = {
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
export const guides = {
  foldDasharray: "5,2", // PT
  textFontSizePT: 12,
};

//  BLEED
export const bleed = {
  sm: {
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

//  PDF
export const pdf = {
  marginMM: 28,
};

export const DIMENSIONS = [
  { key: "length", label: "طول" },
  { key: "width", label: "عرض" },
  { key: "height", label: "ارتفاع" },
] as const;

export const FORMATS = [
  { value: "PDF", icon: pdfIcon },
  { value: "AI", icon: aiIcon },
  { value: "DXF", icon: dxfIcon },
] as const;

export const DIMENSIONS_TYPE = [
  { key: "manufacture", label: "ابعاد تولید" },
  { key: "inner", label: "ابعاد داخلی" },
  { key: "outer", label: "ابعاد خارجی" },
] as const;

export const MATERIALS = [
  {
    label: "مقوا",
    items: [
      { value: "white-cardboard", label: "مقوا سفید", color: "bg-white" },
      { value: "kraft-cardboard", label: "مقوا کرافت", color: "bg-orange-100" },
    ],
  },
  {
    label: "کارتن",
    items: [
      { value: "e-flute", label: "کارتن E-Flut", color: "bg-orange-100" },
      { value: "b-flute", label: "کارتن B-Flut", color: "bg-orange-100" },
      { value: "c-flute", label: "کارتن C-Flut", color: "bg-orange-100" },
    ],
  },
];
