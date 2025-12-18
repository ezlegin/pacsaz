import { FormatsType, SVGModel } from "@/lib/dielines/core/types";
import { PDFGenerator } from "./PDFGenerator";

type NewType = FormatsType;

interface ExportPdfParams {
  svg: SVGModel;
  format: NewType;
  slug: string;
}

export async function downloadPdf({ format, svg, slug }: ExportPdfParams) {
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

  const fileName = `${slug}-dieline`;

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.${format}`;
  a.click();

  URL.revokeObjectURL(url);
}
