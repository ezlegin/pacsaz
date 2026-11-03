import { exportBounds, toDXF, toSVG, type RenderResult } from "@repo/dieline-engine";
import path from "node:path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

export type FileFormat = "pdf" | "ai" | "dxf";

const PT_PER_MM = 72 / 25.4;
/** Room around the drawing for the information block. */
const PADDING = 20;

/**
 * The production file for a rendered dieline. Built on the server from the
 * engine's own render, never from anything the browser sends, so a download is
 * always the template at a verified size and customization.
 */
export async function buildDielineFile(
  result: RenderResult,
  format: FileFormat,
  info: { slug: string; bleed: number },
): Promise<{ base64: string; mime: string }> {
  if (format === "dxf") {
    return { base64: Buffer.from(toDXF(result, { includeBleed: true }), "utf8").toString("base64"), mime: "application/dxf" };
  }

  // Illustrator opens PDFs directly, so "ai" is the same file with its own name.
  const svg = toSVG(result, { includeRulers: true, includeBleed: true, padding: PADDING, strokeWidth: 0.35 });
  const b = exportBounds(result, { includeRulers: true, includeBleed: true }) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const trim = result.bounds ?? b;
  const widthMm = b.maxX - b.minX + PADDING * 2;
  const heightMm = b.maxY - b.minY + PADDING * 2;

  const doc = new PDFDocument({
    size: [widthMm * PT_PER_MM, heightMm * PT_PER_MM],
    margin: 0,
    font: path.join(process.cwd(), "public/fonts/ARIAL.TTF"),
    info: { Title: `PacSaz Dieline · ${info.slug}` },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  SVGtoPDF(doc, svg, 0, 0, { width: widthMm * PT_PER_MM, height: heightMm * PT_PER_MM, preserveAspectRatio: "xMinYMin meet" });

  const f = (n: number) => n.toFixed(1);
  doc
    .fontSize(7)
    .fillColor("#1E90FF")
    .text(
      [
        "Created By: PacSaz.ir",
        `Slug: ${info.slug}`,
        `Bleed: ${info.bleed} mm`,
        `Trim Size: ${f(trim.maxX - trim.minX)} x ${f(trim.maxY - trim.minY)} mm`,
      ].join("\n"),
      8,
      8,
      { lineGap: 2 },
    );
  doc.end();

  return { base64: (await done).toString("base64"), mime: "application/pdf" };
}
