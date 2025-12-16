import { FormatsType } from "@/lib/dielines/core/types";
import { PDFGenerator, ExportPdfParams } from "./PDFGenerator";

export async function downloadPdf({
  svg,
  format,
  filename,
  docSize,
}: ExportPdfParams & { filename: string; format: FormatsType }) {
  const pdf = await PDFGenerator({
    svg,
    docSize,
  });

  // Decode the base64 PDF
  const byteCharacters = atob(pdf.pdfBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const blob = new Blob([new Uint8Array(byteNumbers)], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);

  // Create and click the download link
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format}`;
  a.click();

  URL.revokeObjectURL(url);
}
