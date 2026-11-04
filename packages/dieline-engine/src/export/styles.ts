import type { LineType } from "../spec/types";

export type LineStyle = {
  color: string;
  /** Dash pattern in millimetres; empty for a solid line. */
  dash: number[];
  /** Relative stroke weight; 1 is the base width. */
  weight: number;
  label: string;
};

/**
 * One visual language for line types, shared by the SVG export and the editor
 * canvas, following common die-making colours: blue cut, red crease.
 */
export const LINE_STYLES: Record<LineType, LineStyle> = {
  cut: { color: "#1d4ed8", dash: [], weight: 1, label: "Cut" },
  crease: { color: "#dc2626", dash: [4, 2.5], weight: 1, label: "Crease" },
  reverseCrease: { color: "#dc2626", dash: [6, 1.5, 1, 1.5], weight: 1, label: "Reverse crease" },
  perf: { color: "#c026d3", dash: [1, 1.5], weight: 1.2, label: "Perforation" },
  cutCrease: { color: "#ea580c", dash: [3, 1.5], weight: 1, label: "Cut-crease" },
  halfCut: { color: "#0891b2", dash: [2, 1], weight: 0.8, label: "Half cut" },
  glue: { color: "#16a34a", dash: [1.5, 1], weight: 0.8, label: "Glue area" },
  guide: { color: "#9ca3af", dash: [1, 1], weight: 0.6, label: "Guide" },
};

/** DXF layer names, the way die makers expect to find them. */
export const DXF_LAYERS: Record<Exclude<LineType, "guide">, string> = {
  cut: "CUT",
  crease: "CREASE",
  reverseCrease: "REVERSE_CREASE",
  perf: "PERFORATION",
  cutCrease: "CUT_CREASE",
  halfCut: "HALF_CUT",
  glue: "GLUE",
};

/**
 * Glue areas are filled with fine dark diagonal hatching, rising to the right,
 * as on a printed drawing. Sizes in millimetres of the drawing.
 */
export const GLUE_HATCH = { color: "#1f1f1f", spacing: 1, width: 0.25 } as const;
