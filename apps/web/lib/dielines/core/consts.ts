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
