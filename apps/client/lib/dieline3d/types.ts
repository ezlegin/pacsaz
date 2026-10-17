/**
 * Types for turning a flat dieline into a foldable 3D rig.
 *
 * The generator emits a layered SVG (trim / fold / perf) with no face or fold
 * metadata, so the rig is derived from the geometry: the flat pattern is a
 * planar subdivision whose faces become rigid panels and whose fold edges become
 * hinges. See `buildFoldRig.ts` for the pipeline.
 */

export type Pt = [number, number];

/** Which generator layer a segment came from. */
export type SegmentKind = "trim" | "fold" | "perf";

export type Segment = {
  a: Pt;
  b: Pt;
  kind: SegmentKind;
};

/** A closed region of the flat pattern — one rigid panel in 3D. */
export type Face = {
  id: number;
  /** Boundary in flat (SVG) coordinates, wound counter-clockwise. */
  outline: Pt[];
  /** Signed area in mm²; positive for CCW. */
  area: number;
  centroid: Pt;
};

/** A hinge between two faces, along a fold or perf segment. */
export type Hinge = {
  id: number;
  /** Faces sharing this edge. `b` is null on the outer boundary. */
  a: number;
  b: number | null;
  /** Hinge line in flat coordinates. */
  from: Pt;
  to: Pt;
  /** Fold angle at full closure, in radians. */
  angle: number;
  /** True when the two faces fold toward the viewer of the flat pattern. */
  valley: boolean;
  kind: Exclude<SegmentKind, "trim">;
};

/**
 * A face together with its place in the fold hierarchy. `parent` is the face it
 * hinges from; `null` marks the root panel the whole box folds around.
 */
export type RigNode = {
  face: Face;
  parent: number | null;
  depth: number;
  /** World-space origin of the hinge this face rotates about. */
  pivot: Pt;
  /** Unit direction of the hinge axis in flat space. */
  axis: Pt;
  /** Rotation sign for this node, already resolved by the direction heuristic. */
  sign: 1 | -1;
  angle: number;
  kind: Exclude<SegmentKind, "trim">;
};

export type FoldRig = {
  nodes: RigNode[];
  rootId: number;
  /** Bounding box of the flat pattern, in mm. */
  bounds: { min: Pt; max: Pt; width: number; height: number };
  /** Diagnostics so the UI can warn instead of silently showing nonsense. */
  stats: {
    segmentCount: number;
    faceCount: number;
    hingeCount: number;
    /** Faces that never connected to the root — drawn flat. */
    orphanCount: number;
    /** True when no fold lines were found at all. */
    degenerate: boolean;
  };
};
