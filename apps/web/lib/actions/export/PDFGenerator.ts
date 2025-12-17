"use server";

import { COLORS, MARGINS } from "@/lib/dielines/core/consts";
import { mmToPt } from "@/utils/sizeConvertor";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

export type ExportPdfParams = {
  svg: string;
  svgSize: {
    widthMM: number;
    lengthMM: number;
  };
};

export async function PDFGenerator({
  svg,
  svgSize: { lengthMM, widthMM },
}: ExportPdfParams) {
  const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");

  const docWidth = mmToPt(widthMM + MARGINS.pdf * 2);
  const docLength = mmToPt(lengthMM + MARGINS.pdf * 2);
  const doc = new PDFDocument({
    size: [docWidth, docLength],
    font: fontPath,
    info: {
      Title: "PacSaz Dieline",
    },
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.on("end", () => {});

  const guideText = [
    "Created By: PacSaz.ir",
    "------------------------------",
    "Bleed: 3mm",
    `Trim Size: ${180} x ${160} x 0 mm`, //todo
    `Bleed Size: ${widthMM} x ${lengthMM} x 0 mm`,
  ].join("\n");

  doc.fontSize(9).fillColor(COLORS.guides.text).text(guideText, 6, 6);

  SVGtoPDF(doc, svg, mmToPt(MARGINS.pdf), mmToPt(MARGINS.pdf), {
    assumePt: true,
  });

  doc.end();

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return {
    pdfBase64: pdfBuffer.toString("base64"),
  };
}
