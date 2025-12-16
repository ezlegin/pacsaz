import { mmToPt } from "./helpers/sizeConvertor";

export const colors = {
  bleed: "green",
  trim: "blue",
  fold: "red",
  dielineFill: "white",

  // GUIDES
  guideBox: "white",
  guideLine: "#1E90FF", // dodgerBlue
  guideText: "#1E90FF", // dodgerBlue
};

export const foldDasharray = "5,2"; // in PT
export const guideTextFontSize = 12; // in PT
export const bleedMM = 3; // in MM
export const bleedPT = mmToPt(3); // in MM
export const PDFDocMarginMM = 25; // in mm;
