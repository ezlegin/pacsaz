import { Model } from "@repo/dieline-core/data/types";
import { useDimensionStore } from "@repo/dieline-core/store/dimension.store";
import { useFormatStore } from "@repo/dieline-core/store/format.store";
import { mapDimensions } from "@repo/dieline-core/utils/mapDimensions";
import { PDFGenerator } from "./PDFGenerator";

interface ExportPdfParams {
  svg: Model;
  slug: string;
}

export async function downloadPdf({ svg, slug }: ExportPdfParams) {
  const { format } = useFormatStore();
  const { dimension } = useDimensionStore();

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
    dimension.width,
    dimension.length,
    dimension.height
  );
  const fileName = `${slug}-dieline__${dim}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.${format}`;
  a.click();

  URL.revokeObjectURL(url);
}
