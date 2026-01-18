"use server";

import { COLORS } from "@repo/dieline-core/data/consts";
import { Model } from "@repo/dieline-core/data/types";
import { toMm } from "@repo/dieline-core/utils/sizeConvertor";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

interface Props {
  svg: Model;
  slug: string;
}

export async function PDFGenerator({ svg, slug }: Props) {
  const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");
  const { sizes } = svg;

  const docWidth = sizes.container.width;
  const docHeight = sizes.container.height;
  const doc = new PDFDocument({
    size: [docWidth, docHeight],
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
    `Bleed: ${toMm(sizes.bleedAmount)} mm`,
    `Trim Size: ${toMm(sizes.trim.width).toFixed(1)} x ${toMm(sizes.trim.height).toFixed(1)} mm`,
    `Bleed Size: ${toMm(sizes.bleed.width).toFixed(1)} x ${toMm(sizes.bleed.height).toFixed(1)} mm`,
  ].join("\n");

  doc
    .fontSize(9)
    .fillColor(COLORS.guides.text)
    .text(guideText, 10, 10, { lineGap: 3 });

  const imageWidth = 30;
  const image = path.join(process.cwd(), "public/logos/pacsaz-logo.png");
  doc.image(image, docWidth - imageWidth - 10, 10, { width: imageWidth });

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
