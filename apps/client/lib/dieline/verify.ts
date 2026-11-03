import { verifyCustomization, type Customization, type DielineDocument, type RenderResult } from "@repo/dieline-engine";
import { clampSize, loadTemplate, manufactureSize, type DimensionType } from "./engine";

export type RequestedSettings = {
  width: number;
  length: number;
  height: number;
  thickness: number;
  bleed: number;
  material: string;
  dimensionType: DimensionType;
};

type TemplateRow = {
  specification: string;
  materials: string;
  minWidth: number;
  minLength: number;
  minHeight: number;
  maxWidth: number;
  maxLength: number;
  maxHeight: number;
};

export type Verified =
  | { ok: true; template: DielineDocument; result: RenderResult; settings: RequestedSettings }
  | { ok: false; error: string };

/**
 * The server's own render of what a customer asked for. The size is clamped to
 * the template's range, the material must be one the template offers, and a
 * customization must pass the same `verifyCustomization` the Customizer shows.
 * Nothing from the browser is trusted beyond these numbers and the overlay.
 */
export function verifyRequest(row: TemplateRow, requested: RequestedSettings, customization: Customization): Verified {
  const template = loadTemplate(row.specification);
  if (!template) return { ok: false, error: "این قالب هنوز برای ویرایشگر جدید آماده نشده است." };
  if (!row.materials.split(",").includes(requested.material)) return { ok: false, error: "متریال انتخاب‌شده برای این قالب مجاز نیست." };

  const numbers = [requested.width, requested.length, requested.height, requested.thickness, requested.bleed];
  if (!numbers.every((n) => Number.isFinite(n) && n >= 0) || requested.thickness <= 0 || requested.thickness > 20 || requested.bleed > 20) {
    return { ok: false, error: "تنظیمات ابعاد معتبر نیست." };
  }

  const raw = clampSize(
    requested,
    { width: row.minWidth, length: row.minLength, height: row.minHeight },
    { width: row.maxWidth, length: row.maxLength, height: row.maxHeight },
  );
  const size = manufactureSize(raw, requested.dimensionType, requested.material, requested.thickness);
  const inputs = { ...size, thickness: requested.thickness, bleed: requested.bleed };

  const verified = verifyCustomization(template, customization, inputs);
  if (!verified.ok) {
    return { ok: false, error: `ویرایش‌های این قالب قابل تولید نیستند: ${verified.problems[0]?.message ?? ""}` };
  }
  return { ok: true, template, result: verified.result, settings: { ...requested, ...raw } };
}
