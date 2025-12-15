"use server";

import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

const MM_TO_PT = 72 / 25.4;
const margin = 25; // in mm

export type ExportPdfParams = {
  svg: string;
  width: number;
  length: number;
};

export async function PDFGenerator({ svg, length, width }: ExportPdfParams) {
  const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");

  const doc = new PDFDocument({
    size: [(width + margin * 2) * MM_TO_PT, (length + margin * 2) * MM_TO_PT],
    font: fontPath,
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.on("end", () => {});

  SVGtoPDF(doc, svg, margin * MM_TO_PT, margin * MM_TO_PT, {
    assumePt: false,
  });

  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return {
    pdfBase64: pdfBuffer.toString("base64"),
  };
}
