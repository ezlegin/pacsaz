import { mapDimensions } from "@repo/dieline-core/utils/mapDimensions";
import { getDielineCTX } from "@repo/store/dieline/context.store";
import { PDFGenerator } from "./PDFGenerator";
import { getOverallSizes } from "@repo/store/dieline/overallSize.store";
import { getBleed } from "@repo/store/dieline/bleed.store";

interface ExportPdfParams {
  svg: string;
  slug: string;
}

type DownloadPdfResult =
  | { success: true }
  | { success: false; message: string };

export async function downloadPdf({
  svg,
  slug,
}: ExportPdfParams): Promise<DownloadPdfResult> {
  const { dimension, format } = getDielineCTX();
  const overallSizes = getOverallSizes();
  const bleedAmount = getBleed();

  const pdf = await PDFGenerator({
    svg,
    slug,
    overallSizes: overallSizes,
    bleedAmount,
  });

  if (!pdf.success) {
    return {
      success: false,
      message: pdf.message,
    };
  }

  const byteCharacters = atob(pdf.pdfBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const blob = new Blob([new Uint8Array(byteNumbers)], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);

  const dim = mapDimensions(
    dimension.raw.width,
    dimension.raw.length,
    dimension.raw.height
  );
  const fileName = `${slug}-dieline__${dim}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.${format}`;
  a.click();

  URL.revokeObjectURL(url);

  return { success: true };
}
