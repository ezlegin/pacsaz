"use server";

import { handleServerError } from "@/utils/handleServerError";
import { COLORS } from "@repo/dieline-core/data/consts";
import { toMm } from "@repo/dieline-core/utils/sizeConvertor";
import { OverallSizes } from "@repo/store/dieline/overallSize.store";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

interface Props {
  svg: string;
  overallSizes: OverallSizes;
  slug: string;
  bleedAmount: number;
}

type PDFGeneratorResult =
  | { success: true; pdfBase64: string }
  | { success: false; message: string };

export async function PDFGenerator({
  svg,
  slug,
  overallSizes,
  bleedAmount,
}: Props): Promise<PDFGeneratorResult> {
  try {
    const fontPath = path.join(process.cwd(), "public/fonts/ARIAL.TTF");

    const { bleed, container, trim } = overallSizes;
    if (!trim || !bleed || !container) {
      throw new Error("Overall sizes are not provided. [PDFGenerator]");
    }

    const sizes = {
      trim: {
        width: toMm(trim.width).toFixed(1),
        height: toMm(trim.height).toFixed(1),
      },
      bleed: {
        width: toMm(bleed.width).toFixed(1),
        height: toMm(bleed.height).toFixed(1),
      },
      container: {
        width: container.width,
        height: container.height,
      },
    };

    const docWidth = sizes.container.width;
    const docHeight = sizes.container.height;

    const doc = new PDFDocument({
      size: [docWidth, docHeight],
      font: fontPath,
      info: { Title: "PacSaz Dieline" },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const guideText = [
      "Created By: PacSaz.ir",
      `Slug: ${slug}`,
      `Bleed: ${bleedAmount} mm`,
      `Trim Size: ${sizes.trim.width} x ${sizes.trim.height} mm`,
      `Bleed Size: ${sizes.bleed.width} x ${sizes.bleed.height} mm`,
    ].join("\n");

    const offset = 10;
    doc
      .fontSize(9)
      .fillColor(COLORS.guides.text)
      .text(guideText, offset, offset, { lineGap: 3 });

    const imageWidth = 30;
    const image = path.join(process.cwd(), "public/logos/pacsaz-logo.png");
    doc.image(image, docWidth - imageWidth - offset, offset, {
      width: imageWidth,
    });

    SVGtoPDF(doc, svg, 0, 0, { assumePt: true });

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    return {
      success: true,
      pdfBase64: pdfBuffer.toString("base64"),
    };
  } catch (error: unknown) {
    return handleServerError(error, "PDFGenerator");
  }
}
