import type { Pt, Segment, SegmentKind } from "./types";

/**
 * Flattens the dieline's exported SVG paths into straight segments.
 *
 * The generator emits line-dominant geometry (makerjs paths, plus fillets and
 * arcs), so curves are sampled rather than kept exact — a fold rig only needs the
 * panel boundaries to within a fraction of a millimetre, and keeping everything
 * as segments makes the planar pass far simpler.
 */

/** Maximum sagitta error when flattening an arc, in mm. */
const ARC_TOLERANCE = 0.05;
/** Segments per full circle for elliptical arcs. */
const ARC_MIN_STEPS = 8;
const ARC_MAX_STEPS = 64;

type Cursor = { i: number; tokens: string[] };

/** Tokenises a path `d` attribute into command letters and numbers. */
const tokenize = (d: string): string[] =>
  d.match(/[a-zA-Z]|[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g) ?? [];

const isCommand = (token: string) => /^[a-zA-Z]$/.test(token);

const readNumber = (cursor: Cursor): number => {
  const token = cursor.tokens[cursor.i++];
  if (token === undefined) throw new Error("Unexpected end of path data");

  const value = Number(token);
  if (Number.isNaN(value)) throw new Error(`Bad number in path: ${token}`);

  return value;
};

const readPoint = (cursor: Cursor): Pt => [
  readNumber(cursor),
  readNumber(cursor),
];

/** Samples an elliptical arc into points, per the SVG implementation notes. */
const sampleArc = (
  from: Pt,
  rx: number,
  ry: number,
  angleDeg: number,
  largeArc: boolean,
  sweep: boolean,
  to: Pt,
): Pt[] => {
  const [x1, y1] = from;
  const [x2, y2] = to;

  // Degenerate radii: the spec says treat the arc as a straight line.
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return [to];

  const phi = (angleDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  let rxA = Math.abs(rx);
  let ryA = Math.abs(ry);

  // Scale radii up when they are too small to span the endpoints.
  const lambda = (x1p * x1p) / (rxA * rxA) + (y1p * y1p) / (ryA * ryA);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rxA *= scale;
    ryA *= scale;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const numerator =
    rxA * rxA * ryA * ryA - rxA * rxA * y1p * y1p - ryA * ryA * x1p * x1p;
  const denominator = rxA * rxA * y1p * y1p + ryA * ryA * x1p * x1p;
  const coef = sign * Math.sqrt(Math.max(0, numerator / denominator));

  const cxp = (coef * rxA * y1p) / ryA;
  const cyp = (-coef * ryA * x1p) / rxA;

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const angleOf = (ux: number, uy: number) => Math.atan2(uy, ux);
  const startAngle = angleOf((x1p - cxp) / rxA, (y1p - cyp) / ryA);
  const endAngle = angleOf((-x1p - cxp) / rxA, (-y1p - cyp) / ryA);

  let delta = endAngle - startAngle;
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const radius = Math.max(rxA, ryA);
  const steps = Math.min(
    ARC_MAX_STEPS,
    Math.max(
      ARC_MIN_STEPS,
      Math.ceil(Math.abs(delta) / (2 * Math.acos(1 - ARC_TOLERANCE / radius))),
    ),
  );

  const points: Pt[] = [];
  for (let step = 1; step <= steps; step++) {
    const theta = startAngle + (delta * step) / steps;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    points.push([
      cosPhi * rxA * cosTheta - sinPhi * ryA * sinTheta + cx,
      sinPhi * rxA * cosTheta + cosPhi * ryA * sinTheta + cy,
    ]);
  }

  return points;
};

/** Samples a cubic or quadratic bezier into points. */
const sampleCurve = (
  from: Pt,
  control: Pt[],
  to: Pt,
  steps = 12,
): Pt[] => {
  const points: Pt[] = [];

  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    const mt = 1 - t;

    if (control.length === 2) {
      const [c1, c2] = control as [Pt, Pt];
      points.push([
        mt * mt * mt * from[0] +
          3 * mt * mt * t * c1[0] +
          3 * mt * t * t * c2[0] +
          t * t * t * to[0],
        mt * mt * mt * from[1] +
          3 * mt * mt * t * c1[1] +
          3 * mt * t * t * c2[1] +
          t * t * t * to[1],
      ]);
    } else {
      const [c] = control as [Pt];
      points.push([
        mt * mt * from[0] + 2 * mt * t * c[0] + t * t * to[0],
        mt * mt * from[1] + 2 * mt * t * c[1] + t * t * to[1],
      ]);
    }
  }

  return points;
};

/**
 * Parses one SVG `d` attribute into polylines. Subpaths are returned separately
 * because a single `d` may hold several disjoint pieces.
 */
export const parsePathToPolylines = (d: string): Pt[][] => {
  const cursor: Cursor = { i: 0, tokens: tokenize(d) };
  const polylines: Pt[][] = [];

  let current: Pt = [0, 0];
  let subpathStart: Pt = [0, 0];
  let polyline: Pt[] = [];
  let command = "";

  const pushPolyline = () => {
    if (polyline.length > 1) polylines.push(polyline);
    polyline = [];
  };

  while (cursor.i < cursor.tokens.length) {
    const token = cursor.tokens[cursor.i];
    if (token === undefined) break;

    if (isCommand(token)) {
      command = token;
      cursor.i++;
    } else if (command === "") {
      // Numbers before any command: nothing sensible to do.
      cursor.i++;
      continue;
    } else if (command === "M") {
      // A repeated moveto means implicit lineto.
      command = "L";
    } else if (command === "m") {
      command = "l";
    }

    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();

    switch (upper) {
      case "M": {
        const point = readPoint(cursor);
        pushPolyline();
        current = relative
          ? [current[0] + point[0], current[1] + point[1]]
          : point;
        subpathStart = current;
        polyline = [current];
        break;
      }

      case "L": {
        const point = readPoint(cursor);
        current = relative
          ? [current[0] + point[0], current[1] + point[1]]
          : point;
        polyline.push(current);
        break;
      }

      case "H": {
        const x = readNumber(cursor);
        current = [relative ? current[0] + x : x, current[1]];
        polyline.push(current);
        break;
      }

      case "V": {
        const y = readNumber(cursor);
        current = [current[0], relative ? current[1] + y : y];
        polyline.push(current);
        break;
      }

      case "C": {
        const c1 = readPoint(cursor);
        const c2 = readPoint(cursor);
        const end = readPoint(cursor);
        const abs = (p: Pt): Pt =>
          relative ? [current[0] + p[0], current[1] + p[1]] : p;
        const target = abs(end);
        polyline.push(...sampleCurve(current, [abs(c1), abs(c2)], target));
        current = target;
        break;
      }

      case "S": {
        const c2 = readPoint(cursor);
        const end = readPoint(cursor);
        const abs = (p: Pt): Pt =>
          relative ? [current[0] + p[0], current[1] + p[1]] : p;
        const target = abs(end);
        // Reflect the previous control point; without history, use `current`.
        polyline.push(
          ...sampleCurve(current, [current, abs(c2)], target),
        );
        current = target;
        break;
      }

      case "Q": {
        const c = readPoint(cursor);
        const end = readPoint(cursor);
        const abs = (p: Pt): Pt =>
          relative ? [current[0] + p[0], current[1] + p[1]] : p;
        const target = abs(end);
        polyline.push(...sampleCurve(current, [abs(c)], target));
        current = target;
        break;
      }

      case "T": {
        const end = readPoint(cursor);
        const target: Pt = relative
          ? [current[0] + end[0], current[1] + end[1]]
          : end;
        polyline.push(...sampleCurve(current, [current], target));
        current = target;
        break;
      }

      case "A": {
        const rx = readNumber(cursor);
        const ry = readNumber(cursor);
        const angle = readNumber(cursor);
        const largeArc = readNumber(cursor) !== 0;
        const sweep = readNumber(cursor) !== 0;
        const end = readPoint(cursor);
        const target: Pt = relative
          ? [current[0] + end[0], current[1] + end[1]]
          : end;

        polyline.push(
          ...sampleArc(current, rx, ry, angle, largeArc, sweep, target),
        );
        current = target;
        break;
      }

      case "Z": {
        if (polyline.length > 0) {
          polyline.push(subpathStart);
          pushPolyline();
        }
        current = subpathStart;
        command = "";
        break;
      }

      default:
        // Unknown command: skip its numbers defensively.
        cursor.i++;
        break;
    }
  }

  pushPolyline();
  return polylines;
};

/** Converts polylines into segments, dropping zero-length ones. */
export const polylinesToSegments = (
  polylines: Pt[][],
  kind: SegmentKind,
): Segment[] => {
  const segments: Segment[] = [];

  for (const line of polylines) {
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i]!;
      const b = line[i + 1]!;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];

      // Ignore degenerate edges: they add vertices with no direction, which
      // breaks the angular ordering used by the face trace.
      if (Math.hypot(dx, dy) < 1e-6) continue;

      segments.push({ a, b, kind });
    }
  }

  return segments;
};
