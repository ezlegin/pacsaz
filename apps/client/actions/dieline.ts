"use server";

import { serverErrorMessage } from "@/data/consts";
import { canCustomize } from "@/lib/dieline/access";
import { loadTemplate } from "@/lib/dieline/engine";
import { buildDielineFile, type FileFormat } from "@/lib/dieline/exportFile";
import { verifyRequest } from "@/lib/dieline/verify";
import { SaveDielineFormType } from "@/lib/validatoinSchema";
import { getSessionUser } from "@repo/auth/session";
import { rateLimit, waitFa } from "@repo/db/data/rateLimit";
import { DimensionType, prisma, type Plan } from "@repo/db";
import { parseCustomization, validateCustomization, type Customization } from "@repo/dieline-engine";
import { MaterialKey } from "@repo/store/types";
import { materials } from "@repo/dieline-core/data/materials";

export interface Settings {
  width: number;
  length: number;
  height: number;
  material: MaterialKey;
  bleed: number;
  dimensionType: DimensionType;
  thickness: number;
}

type Accepted = { ok: true; customization: Customization; stored: string } | { ok: false; error: string };

/**
 * Reads a customization sent by the browser. Empty means a plain resize, which
 * every plan may do; anything else needs a Customize plan and may only touch
 * what the template exposes. Returns the overlay and its JSON for storage.
 */
function acceptCustomization(json: string | undefined, specification: string, plan: Plan | null): Accepted {
  if (!json) return { ok: true, customization: {}, stored: "" };

  let parsed: ReturnType<typeof parseCustomization>;
  try {
    parsed = parseCustomization(JSON.parse(json));
  } catch {
    return { ok: false, error: "ویرایش‌های قالب قابل خواندن نیستند." };
  }
  if (!parsed.ok) return { ok: false, error: "ویرایش‌های قالب قابل خواندن نیستند." };

  const customization = parsed.customization;
  if (Object.keys(customization).length === 0) return { ok: true, customization, stored: "" };

  if (!canCustomize(plan)) return { ok: false, error: "ویرایش پیشرفته‌ی قالب در پلن شما فعال نیست." };
  const template = loadTemplate(specification);
  if (!template || validateCustomization(template, customization).length > 0) {
    return { ok: false, error: "این تغییرات برای این قالب مجاز نیست." };
  }
  return { ok: true, customization, stored: JSON.stringify(customization) };
}

/**
 * Downloads a dieline. The file is rendered here from the template, the
 * requested size and the customization, after the plan, the size range and the
 * customization have been checked; the browser only receives the result.
 */
export const downloadDieline = async (
  slug: string,
  settings: Settings,
  format: FileFormat,
  customizationJson?: string,
): Promise<{ error: string } | { file: string; mime: string; fileName: string }> => {
  try {
    const user = await getSessionUser();
    if (!user) return { error: "برای دانلود ابتدا وارد شوید." };
    const plan = user.plan;
    if (!plan) return { error: "برای دانلود به اشتراک فعال نیاز دارید." };
    if (plan.downloaded >= plan.fairDownload) return { error: "شما به حداکثر تعداد دانلود رسیده اید." };
    // Each download renders on the server: 10 a minute per account is far
    // above real use and keeps a script from tying up the CPU.
    const pace = await rateLimit(`download:user:${user.id}`, 10, 60);
    if (!pace.ok) return { error: `دانلودها پشت سر هم زیاد شد. ${waitFa(pace.retryAfterSeconds)} دیگر دوباره تلاش کنید.` };
    if (!["pdf", "ai", "dxf"].includes(format)) return { error: "فرمت فایل معتبر نیست." };

    const dieline = await prisma.dieline.findFirst({ where: { slug, active: true }, include: { settings: true } });
    if (!dieline) return { error: "قالب یافت نشد." };

    // Bleed and thickness are premium settings: on Standard the panel locks
    // them to the template's values (or the chosen material's own thickness),
    // and the server holds to the same.
    if (!plan.isPremium && dieline.settings) {
      const materialThickness = materials.find((m) => m.value === settings.material)?.thickness;
      const thicknessOk = [dieline.settings.thickness, materialThickness].includes(settings.thickness);
      if (settings.bleed !== dieline.settings.bleed || !thicknessOk)
        return { error: "تغییر بلید و ضخامت در پلن شما فعال نیست." };
    }

    const accepted = acceptCustomization(customizationJson, dieline.specification, plan);
    if (!accepted.ok) return { error: accepted.error };

    const verified = verifyRequest(dieline, settings, accepted.customization);
    if (!verified.ok) return { error: verified.error };
    const s = verified.settings;

    const file = await buildDielineFile(verified.result, format, { slug, bleed: s.bleed });

    await prisma.$transaction(async (ts) => {
      await ts.downloadHistory.create({
        data: {
          userId: user.id,
          dielineId: dieline.id,
          planId: plan.id,
          settings: {
            create: {
              height: s.height,
              length: s.length,
              width: s.width,
              bleed: s.bleed,
              dimensionType: s.dimensionType,
              material: s.material,
              thickness: s.thickness,
              customization: accepted.stored,
            },
          },
        },
      });
      // Counted only while under the quota, in the same step, so two downloads
      // fired at once cannot both slip past the check above.
      const counted = await ts.plan.updateMany({
        where: { id: plan.id, downloaded: { lt: plan.fairDownload } },
        data: { downloaded: { increment: 1 } },
      });
      if (counted.count === 0) throw new QuotaReached();
    });

    const dims = `${s.width}x${s.length}${s.height ? `x${s.height}` : ""}mm`;
    return {
      file: file.base64,
      mime: file.mime,
      fileName: `${slug}-${dims}${accepted.stored ? "-custom" : ""}.${format}`,
    };
  } catch (error) {
    if (error instanceof QuotaReached) return { error: "شما به حداکثر تعداد دانلود رسیده اید." };
    console.error(error);
    return { error: serverErrorMessage };
  }
};

class QuotaReached extends Error {}

export const createSaveDieline = async (
  data: SaveDielineFormType,
  slug: string,
  customizationJson?: string,
) => {
  const {
    bleed,
    height,
    length,
    material,
    thickness,
    title,
    width,
    description,
    dimensionType,
    customerId,
  } = data;
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("Use Not Found.");
    // Saved copies are a premium feature; the form's disabled button is not a gate.
    if (!user.plan?.isPremium) return { error: "ذخیره‌ی نسخه‌ها در پلن شما فعال نیست." };

    const existingDieline = await prisma.dieline.findFirst({ where: { slug } });
    if (!existingDieline) throw new Error("Dieline Not Found.");

    const accepted = acceptCustomization(customizationJson, existingDieline.specification, user.plan);
    if (!accepted.ok) return { error: accepted.error };

    if (customerId) {
      const existingCustoer = await prisma.customer.findFirst({
        where: { id: +customerId, userId: user.id },
      });
      if (!existingCustoer)
        return { error: "مشتری یافت نشد. لطفا ابتدا مشتری ایجاد کنید.." };
    }

    const saved = await prisma.savedDieline.create({
      data: {
        userId: user.id,
        description: description ?? "",
        dielineId: existingDieline.id,
        title,
        customerId: customerId ? +customerId : null,
        settings: {
          create: {
            height,
            length,
            width,
            bleed,
            dimensionType,
            material,
            thickness,
            customization: accepted.stored,
          },
        },
      },
    });

    return { success: "دایلاین با موفقیت ذخیره شد.", id: saved.id };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const updateSavedDieline = async (
  data: SaveDielineFormType,
  id: number,
  customizationJson?: string,
) => {
  const {
    bleed,
    height,
    length,
    material,
    thickness,
    title,
    width,
    description,
    dimensionType,
    customerId,
  } = data;
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");
    if (!user.plan?.isPremium) return { error: "ذخیره‌ی نسخه‌ها در پلن شما فعال نیست." };

    // Only the owner may change a saved copy.
    const existingDieline = await prisma.savedDieline.findFirst({
      where: { id, userId: user.id },
      include: { dieline: true, settings: true },
    });
    if (!existingDieline) throw new Error("Saved Dieline Not Found.");

    // Without a new customization the saved one is kept as it is.
    const accepted: Accepted =
      customizationJson === undefined
        ? { ok: true, customization: {}, stored: existingDieline.settings?.customization ?? "" }
        : acceptCustomization(customizationJson, existingDieline.dieline.specification, user.plan);
    if (!accepted.ok) return { error: accepted.error };

    await prisma.savedDieline.update({
      where: { id },
      data: {
        title,
        description,
        customerId: customerId ? +customerId : null,
        settings: {
          update: {
            data: {
              width,
              height,
              length,
              bleed,
              dimensionType,
              material,
              thickness,
              customization: accepted.stored,
            },
          },
        },
      },
    });

    return { success: "قالب با موفقیت ذخیره شد.", id };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const deleteSavedDieline = async (id: number) => {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    const existingDieline = await prisma.savedDieline.findFirst({
      where: { id, userId: user.id },
    });
    if (!existingDieline) throw new Error("Saved Dieline Not Found.");

    await prisma.savedDieline.delete({
      where: { id },
    });

    return { success: "قالب با موفقیت حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const faveDieline = async (dielineId: number) => {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    const existingDieline = await prisma.dieline.findFirst({
      where: { id: dielineId },
    });
    if (!existingDieline) return { error: "Dieline Not Found." };

    await prisma.favedDieline.create({
      data: { dielineId: existingDieline.id, userId: user.id },
    });

    return { success: "به لیست علاقه مندی ها اضافه شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};

export const unfaveDieline = async (dielineId: number) => {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("User Not Found.");

    const existingDieline = await prisma.dieline.findFirst({
      where: { id: dielineId },
    });
    if (!existingDieline) return { error: "Dieline Not Found." };

    const favedDieline = await prisma.favedDieline.findFirst({
      where: { AND: [{ userId: user.id }, { dielineId: dielineId }] },
    });

    if (!favedDieline) return { error: "Faved Dieline Not Found." };

    await prisma.favedDieline.delete({
      where: { id: favedDieline.id },
    });

    return { success: "از لیست علاقه مندی ها حذف شد." };
  } catch (error) {
    console.error(error);
    return { error: serverErrorMessage };
  }
};
