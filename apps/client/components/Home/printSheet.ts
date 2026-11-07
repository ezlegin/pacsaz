import type { Drawing } from "@/lib/dieline/homeBox";
import { buildFoldRig, extractSegmentsFromSvg } from "@repo/dieline-3d/rig";
import type { PrintFrame } from "@repo/dieline-3d/stage";

type Paint = (context: CanvasRenderingContext2D, frame: PrintFrame) => void;

const WIDTH = 1600;

/**
 * The box print laid flat, for the 2D view: the same painter the 3D press uses,
 * framed on the drawing's bounds (bleed included) so the design runs out into
 * the bleed as a printer wants it. Panels come from the same fold rig as the 3D
 * model, so the front lands on the same panel in both views.
 */
export const printSheet = (paint: Paint, foldSvg: string, drawing: Drawing): string | null => {
  const rig = buildFoldRig(extractSegmentsFromSvg(foldSvg));
  const { minX, minY, maxX, maxY } = drawing.bounds;
  const ratio = WIDTH / (maxX - minX);
  const height = Math.max(2, Math.round((maxY - minY) * ratio));

  const panels = rig.nodes
    .filter((node) => !node.isHole)
    .map((node) => {
      const xs = node.face.outline.map((p) => p[0]);
      const ys = node.face.outline.map((p) => p[1]);
      const left = Math.min(...xs);
      const top = Math.min(...ys);
      return {
        area: Math.abs(node.face.area),
        x: (left - minX) * ratio,
        y: (top - minY) * ratio,
        width: (Math.max(...xs) - left) * ratio,
        height: (Math.max(...ys) - top) * ratio,
      };
    })
    .sort((a, b) => b.area - a.area)
    .slice(0, 2);

  const canvas = Object.assign(document.createElement("canvas"), { width: WIDTH, height });
  const context = canvas.getContext("2d");
  if (!context) return null;
  paint(context, { width: WIDTH, height, panels, scale: ratio, originX: minX, originY: minY });
  return canvas.toDataURL("image/png");
};

/**
 * Puts the print into the preview SVG on the paper, clipped to the bleed and
 * under every line, the way the product page places its watermark.
 */
export const withPrint = (svg: string, image: string, drawing: Drawing) => {
  const { minX, minY, maxX, maxY } = drawing.bounds;
  const layer =
    `<defs><clipPath id="print-sheet"><path d="${drawing.sheet}" clip-rule="evenodd"/></clipPath></defs>` +
    `<image href="${image}" x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" preserveAspectRatio="none" clip-path="url(#print-sheet)"/>`;
  const paper = /<path data-sheet=""[^>]*\/>/.exec(svg);
  return paper ? svg.replace(paper[0], paper[0] + layer) : svg;
};
