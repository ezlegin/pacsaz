"use server";

import { pdf } from "@/lib/dielines/core/consts";
import { mmToPt } from "@/lib/dielines/core/helpers/sizeConvertor";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

export type ExportPdfParams = {
  svg: string;
  docSize: {
    widthMM: number;
    lengthMM: number;
  };
};

export async function PDFGenerator({
  svg,
  docSize: { lengthMM, widthMM },
}: ExportPdfParams) {
  const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");

  const doc = new PDFDocument({
    size: [
      mmToPt(widthMM + pdf.marginMM * 2),
      mmToPt(lengthMM + pdf.marginMM * 2),
    ],
    font: fontPath,
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.on("end", () => {});

  SVGtoPDF(doc, svg, mmToPt(pdf.marginMM), mmToPt(pdf.marginMM), {
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
