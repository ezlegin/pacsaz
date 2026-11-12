/**
 * The fold rig without three.js: what an editor needs to name panels and author
 * folds (face count, a face's outline) without loading the 3D renderer.
 */
export { extractSegmentsFromSvg, extractWindows } from "./extract";
export { buildFoldRig } from "./foldRig";
export { DEFAULT_FOLD_ANGLE, parseFoldConfig, type FoldConfig, type FoldDirection, type FoldOverride, type PiecePlacement } from "./foldConfig";
export { rigPieces } from "./pieces";
export { foldSchedule, stageProgress, type FoldWindow } from "./schedule";
export type { FoldRig, RigNode } from "./types";
