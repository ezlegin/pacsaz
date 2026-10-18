/**
 * Flat dieline -> foldable 3D rig.
 *
 * The generator exports a layered SVG (trim / fold / perf) with no face or fold
 * metadata, so the rig is *derived* from the geometry:
 *
 *   extract  SVG layers -> tagged segments
 *   planar   segments -> planar subdivision -> faces (rigid panels) + hinges
 *   foldRig  faces + hinges -> rooted fold tree with per-panel rotation
 *   build    rig -> three.js scene graph, extruded by material thickness
 *
 * Entry point is `buildFoldRig`, then `buildRigScene` to get something drawable.
 */

export { extractSegmentsFromSvg, svgHasFoldLayer, svgLayerIds } from "./extract";
export { parsePathToPolylines, polylinesToSegments } from "./path";
export { buildPlanarFaces, PLANAR_TOLERANCE } from "./planar";
export {
  buildFoldRig,
  FOLD_CLOSURE_ANGLE,
} from "./foldRig";
export {
  applyFold,
  buildEdgeLines,
  buildRigScene,
  materialStyleFor,
  type MaterialStyle,
  type PanelMesh,
  type RigScene,
} from "./build";

export {
  applyFoldOverrides,
  clampFoldAngle,
  DEFAULT_FOLD_ANGLE,
  degreesToRadians,
  emptyFoldConfig,
  foldConfigStatus,
  MAX_FOLD_ANGLE,
  MIN_FOLD_ANGLE,
  parseFoldConfig,
  radiansToDegrees,
  type FoldConfig,
  type FoldDirection,
  type FoldOverride,
} from "./foldConfig";

export type {
  Face,
  FoldRig,
  Hinge,
  Pt,
  RigNode,
  Segment,
  SegmentKind,
} from "./types";
