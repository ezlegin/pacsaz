import type { CustomizeProblem, EdgeSide } from "@repo/dieline-engine";

/**
 * Every piece of text the Customizer shows. The editor package is English; the
 * client app passes Persian. Names that come from the template itself (param
 * labels, part labels) are shown as the designer wrote them, and library names
 * go through `component` / `param` so an app can translate them.
 */
export type CustomizeStrings = {
  dir: "ltr" | "rtl";
  options: string;
  parts: string;
  edges: string;
  cutouts: string;
  problems: string;
  nothingToCustomize: string;
  allGood: string;
  auto: string;
  reset: string;
  resetAll: string;
  show: string;
  moveX: string;
  moveY: string;
  none: string;
  addRect: string;
  addEllipse: string;
  rect: string;
  ellipse: string;
  panel: string;
  width: string;
  height: string;
  offsetX: string;
  offsetY: string;
  radius: string;
  remove: string;
  fit: string;
  dragHint: string;
  maxCutouts: (count: number, max: number) => string;
  sides: Record<EdgeSide, string>;
  /** Display name of a part, e.g. "lib:tuckLid" → "Tuck lid". */
  component: (id: string, name: string) => string;
  /** Display name of a part's setting, e.g. "depth" → "Depth". */
  param: (name: string, label: string) => string;
  /** Display name of a panel, e.g. "front". */
  panelName: (name: string) => string;
  problem: (problem: CustomizeProblem) => string;
};

export const EN_STRINGS: CustomizeStrings = {
  dir: "ltr",
  options: "Options",
  parts: "Parts",
  edges: "Flaps and closures",
  cutouts: "Windows and holes",
  problems: "Problems",
  nothingToCustomize: "This template has no customer options yet.",
  allGood: "Ready to produce",
  auto: "auto",
  reset: "Reset",
  resetAll: "Reset all changes",
  show: "Include",
  moveX: "Move ↔",
  moveY: "Move ↕",
  none: "None (plain edge)",
  addRect: "Rectangle",
  addEllipse: "Circle / oval",
  rect: "Rectangular window",
  ellipse: "Round window",
  panel: "Panel",
  width: "Width",
  height: "Height",
  offsetX: "From centre ↔",
  offsetY: "From centre ↕",
  radius: "Corner radius",
  remove: "Remove",
  fit: "Fit to screen",
  dragHint: "Drag windows and movable parts on the drawing.",
  maxCutouts: (count, max) => `${count} of ${max}`,
  sides: { top: "top", bottom: "bottom", left: "left edge", right: "right edge" },
  component: (_id, name) => name,
  param: (_name, label) => label,
  panelName: (name) => name,
  problem: (p) => p.message,
};
