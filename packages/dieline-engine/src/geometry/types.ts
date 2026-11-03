import type { LineType } from "../spec/types";

export type Pt = [number, number];

/**
 * Geometry primitives. Arcs run counter-clockwise from `start` to `end` (degrees),
 * which is the makerjs and DXF convention, so conversions are 1:1.
 */
export type Prim =
  | { kind: "line"; a: Pt; b: Pt }
  | { kind: "arc"; c: Pt; r: number; start: number; end: number }
  | { kind: "circle"; c: Pt; r: number };

/** A primitive with what it is for and which node produced it. */
export type Path = Prim & { lineType: LineType; nodeId: string };

export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export const EPSILON = 1e-6;
