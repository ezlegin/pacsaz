import {
  getDielineFile,
  getDielineSettings,
  getOverallSizes,
} from "@repo/store/getters";
import { PDFGenerator } from "./PDFGenerator";

export async function dielineDownloder(slug: string) {
  const overallSizes = getOverallSizes();
  const file = getDielineFile();
  const {
    dimension: {
      raw: { height, length, width },
    },
    format,
  } = getDielineSettings();

  let blob = new Blob([file], { type: "application/dxf" });

  if (format !== "dxf") {
    const pdf = await PDFGenerator({
      svg: file,
      bleedAmount: 5,
      overallSizes,
      slug,
    });

    if (!pdf.success) {
      return {
        success: false,
      };
    }

    const byteCharacters = atob(pdf.pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const unitArray = new Uint8Array(byteNumbers);

    blob = new Blob([unitArray], {
      type: `application/${format}`,
    });
  }

  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  const dims = mapDimensions(width, length, height);
  const fileName = `${slug}-${dims}.${format}`;

  a.download = fileName;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  return {
    success: true,
  };
}

function mapDimensions(width: number, length: number, height?: number) {
  let dim = `${width}x${length}`;
  if (height) dim += "x" + height;

  dim += "mm";
  return dim;
}
