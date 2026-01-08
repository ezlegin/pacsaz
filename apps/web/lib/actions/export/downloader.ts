import { Dimensions, FormatsType, Model } from "@repo/dieline-core/types";
import { PDFGenerator } from "./PDFGenerator";
import { mapDimensions } from "@repo/dieline-core/utils/mapDimensions";

interface ExportPdfParams {
  svg: Model;
  format: FormatsType;
  slug: string;
  dimensions: Dimensions;
}

export async function downloadPdf({
  format,
  svg,
  slug,
  dimensions,
}: ExportPdfParams) {
  const pdf = await PDFGenerator({
    svg,
    slug,
  });

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
    dimensions.width,
    dimensions.length,
    dimensions.height
  );
  const fileName = `${slug}-dieline__${dim}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.${format}`;
  a.click();

  URL.revokeObjectURL(url);
}
