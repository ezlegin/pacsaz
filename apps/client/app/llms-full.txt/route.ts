import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/data/faq";
import { privacy, terms } from "@/data/legal";
import { absoluteUrl, CONTACT, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
import { dielineDescription, materialLabel } from "@/lib/seo/schema";
import { prisma } from "@repo/db";

/**
 * `/llms-full.txt` — the substantive content of the site in one Markdown file.
 *
 * The `llms.txt` convention has two halves: `llms.txt` is the index, and
 * `llms-full.txt` is the material itself, for a model that wants the answers
 * without walking the site. This emits the FAQ and the terms verbatim, plus a
 * catalogue listing, from the same sources the pages render — so the file cannot
 * drift from what a visitor is told.
 */
export const dynamic = "force-dynamic";

const CATALOGUE_LIMIT = 300;

export async function GET() {
  const body = await build();

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

async function build(): Promise<string> {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME} — محتوای کامل`, "");
  lines.push(`> ${SITE_TAGLINE}`, "");
  lines.push(
    `منبع: ${absoluteUrl("/")}`,
    `تماس: ${CONTACT.email} — ${CONTACT.telephone}`,
    "",
    "این فایل محتوای متنی قابل استناد سایت را یک‌جا در اختیار موتورهای پاسخ",
    "قرار می‌دهد تا بدون خزش کامل سایت بتوانند به پرسش‌ها پاسخ دهند.",
    "",
  );

  lines.push("## سوالات متداول", "");
  for (const category of FAQ_CATEGORIES) {
    const items = FAQ_ITEMS.filter((item) => item.category === category.id);
    if (!items.length) continue;

    lines.push(`### ${category.title}`, "");
    for (const item of items) {
      lines.push(`**${item.question}**`, "", item.answer, "");
    }
  }

  for (const doc of [terms, privacy]) {
    lines.push(`## ${doc.title}`, "", doc.intro, "");
    doc.sections.forEach((section, index) => {
      lines.push(`### ماده ${index + 1}. ${section.title}`, "");
      for (const clause of section.clauses) lines.push(`- ${clause}`);
      lines.push("");
    });
  }

  const catalogueSection = await catalogue();
  if (catalogueSection) lines.push(catalogueSection);

  return lines.join("\n");
}

async function catalogue(): Promise<string | null> {
  try {
    const dielines = await prisma.dieline.findMany({
      where: { active: true },
      select: {
        title: true,
        slug: true,
        description: true,
        materials: true,
        minWidth: true,
        minLength: true,
        minHeight: true,
        maxWidth: true,
        maxLength: true,
        maxHeight: true,
      },
      orderBy: { updatedAt: "desc" },
      take: CATALOGUE_LIMIT,
    });

    if (!dielines.length) return null;

    return [
      `## فهرست قالب‌های دایلاین (${dielines.length} مورد)`,
      "",
      ...dielines.map((dieline) =>
        [
          `### ${dieline.title}`,
          "",
          `- نشانی: ${absoluteUrl(`/dieline/${dieline.slug}`)}`,
          `- ابعاد قابل تنظیم: عرض ${dieline.minWidth}–${dieline.maxWidth} mm، طول ${dieline.minLength}–${dieline.maxLength} mm، ارتفاع ${dieline.minHeight}–${dieline.maxHeight} mm`,
          `- متریال: ${dieline.materials.split(",").map(materialLabel).join("، ")}`,
          `- توضیح: ${dielineDescription(dieline)}`,
          "",
        ].join("\n"),
      ),
    ].join("\n");
  } catch (error) {
    console.error("llms-full.txt: could not list dielines", error);
    return null;
  }
}
