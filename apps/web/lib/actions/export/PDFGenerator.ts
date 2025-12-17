"use server";

import { COLORS } from "@/lib/dielines/core/consts";
import { SVGModel } from "@/lib/dielines/core/types";
import { ptToMm } from "@/utils/sizeConvertor";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

interface Props {
  svg: SVGModel;
  slug: string;
}

export async function PDFGenerator({ svg, slug }: Props) {
  const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");
  const { sizes } = svg;

  const doc = new PDFDocument({
    size: [sizes.container.width, sizes.container.height],
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
    `Slug: ${slug}`,
    `Bleed: ${ptToMm(sizes.bleedAmount)} mm`,
    `Trim Size: ${ptToMm(sizes.trim.width)} x ${ptToMm(sizes.trim.height)} mm`,
    `Bleed Size: ${ptToMm(sizes.bleed.width).toFixed()} x ${ptToMm(sizes.bleed.height).toFixed()} mm`,
  ].join("\n");

  doc
    .fontSize(9)
    .fillColor(COLORS.guides.text)
    .text(guideText, 6, 6, { lineGap: 3 });

  SVGtoPDF(doc, svg.model, 0, 0, {
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
