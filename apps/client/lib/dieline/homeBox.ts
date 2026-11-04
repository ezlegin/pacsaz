import {
  checkDieline,
  closedLoops,
  closedPathD,
  loopsD,
  presetBody,
  primLength,
  primToD,
  render,
  resolveDimensions,
  sheetLoops,
  toFoldSVG,
  type Bounds,
  type DielineDocument,
  type DimensionType,
  type Path,
  type PresetId,
  type Prim,
} from "@repo/dieline-engine";

/**
 * The home page's drawings: the engine's real output, broken into the layers the
 * page styles and animates itself. Pure, so the server renders the first drawing
 * into the HTML and the browser loads this module only once a visitor changes
 * the size.
 */

export type BoxSize = { width: number; length: number; height: number };

export type BoxInputs = {
  size: BoxSize;
  dimensionType: DimensionType;
  thickness: number;
  bleed: number;
};

export type Drawing = {
  /** Bleed included, in SVG coordinates (y down). */
  bounds: Bounds;
  /** One closed contour per path, in cutting order: a knife can follow each. */
  contours: string[];
  /** Every cut, with true arcs and the slits a closed contour leaves out. */
  cuts: string;
  folds: string;
  glue: string;
  bleed: string;
  /** The printed sheet, to fill. */
  sheet: string;
  /** Overall size of the flat blank, in millimetres. */
  blank: { width: number; height: number };
  /** Rule lengths, in millimetres: what a die maker prices. */
  knife: number;
  crease: number;
  /** What `checkDieline` found. */
  issues: number;
};

const FOLD_TYPES = new Set(["crease", "reverseCrease", "cutCrease"]);

/** A tenth of a millimetre is plenty on screen, and these paths are the bulk of the page. */
const trim = (d: string) => d.replace(/(\.\d)\d+/g, "$1");
const join = (prims: readonly Prim[]) => trim(prims.map(primToD).join(""));
const total = (prims: readonly Prim[]) => prims.reduce((sum, prim) => sum + primLength(prim), 0);

/** A preset as a document of its own, for the drawings no template stands behind. */
export function presetDocument(id: PresetId): DielineDocument {
  return {
    version: 2,
    params: [],
    variables: [],
    nodes: [{ ...presetBody(id, "body"), id: "body" }],
    rulers: [],
    components: [],
  };
}

const renderBox = (doc: DielineDocument, inputs: BoxInputs) =>
  render(doc, {
    ...resolveDimensions(inputs.size, inputs.dimensionType, inputs.thickness),
    thickness: inputs.thickness,
    bleed: inputs.bleed,
  });

export function buildDrawing(doc: DielineDocument, inputs: BoxInputs): Drawing {
  const result = renderBox(doc, inputs);
  const paths: Path[] = result.paths;

  const cuts = paths.filter((p) => p.lineType === "cut");
  const folds = paths.filter((p) => FOLD_TYPES.has(p.lineType));
  const glue = paths.filter((p) => p.lineType === "glue");

  const edges = result.bounds ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const bleed = result.bleed.length ? closedLoops(result.bleed) : [];
  const points = bleed.flat();
  const xs = [edges.minX, edges.maxX, ...points.map((p) => p[0])];
  const ys = [edges.minY, edges.maxY, ...points.map((p) => p[1])];

  return {
    // Flipped, as the path data is.
    bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: -Math.max(...ys), maxY: -Math.min(...ys) },
    // Longest first, so the knife goes round the outline and then the windows.
    contours: closedLoops(cuts)
      .sort((a, b) => b.length - a.length)
      .map((loop) => trim(loopsD([loop]))),
    cuts: join(cuts),
    folds: join(folds),
    glue: trim(closedPathD(glue)),
    bleed: join(result.bleed),
    sheet: trim(loopsD(sheetLoops(result))),
    blank: { width: edges.maxX - edges.minX, height: edges.maxY - edges.minY },
    knife: total(cuts),
    crease: total(folds),
    issues: checkDieline(result).length,
  };
}

/** The fold SVG `@repo/dieline-3d` builds its rig from. */
export const buildFoldSvg = (doc: DielineDocument, inputs: BoxInputs) => toFoldSVG(renderBox(doc, inputs));

/** A rendering that fits every drawing, so they can share one fixed scale. */
export const unionBounds = (drawings: readonly Drawing[]): Bounds => ({
  minX: Math.min(...drawings.map((d) => d.bounds.minX)),
  minY: Math.min(...drawings.map((d) => d.bounds.minY)),
  maxX: Math.max(...drawings.map((d) => d.bounds.maxX)),
  maxY: Math.max(...drawings.map((d) => d.bounds.maxY)),
});

export const viewBoxOf = (b: Bounds, margin = 0) =>
  `${b.minX - margin} ${b.minY - margin} ${b.maxX - b.minX + margin * 2} ${b.maxY - b.minY + margin * 2}`;
