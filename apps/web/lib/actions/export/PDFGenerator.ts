"use server";

import { COLORS, MARGINS } from "@/lib/dielines/core/consts";
import { SVGModelSizes } from "@/lib/dielines/core/types";
import { mmToPt, ptToMm } from "@/utils/sizeConvertor";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

export type ExportPdfParams = {
  svg: string;
  sizes: SVGModelSizes;
};

export async function PDFGenerator({ svg, sizes }: ExportPdfParams) {
  const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");

  const doc = new PDFDocument({
    size: [
      sizes.container.width + mmToPt(MARGINS.pdf * 2),
      sizes.container.height + mmToPt(MARGINS.pdf * 2),
    ],
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
    `Bleed: ${ptToMm(sizes.bleedAmount)} mm`,
    `Trim Size: ${ptToMm(sizes.trim.width)} x ${ptToMm(sizes.trim.height)} mm`,
    `Bleed Size: ${ptToMm(sizes.bleed.width).toFixed()} x ${ptToMm(sizes.bleed.height).toFixed()} mm`,
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
