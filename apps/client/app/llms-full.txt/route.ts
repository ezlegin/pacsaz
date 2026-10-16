import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/data/faq";
import { termsAndConditions, termsGroups } from "@/data/terms";
import { absoluteUrl, CONTACT, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
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

  lines.push("## قوانین و مقررات", "");
  for (const group of termsGroups) {
    lines.push(`### ${group.title}`, "");
    if (group.description) lines.push(`${group.description}`, "");

    // `items` holds indices into the flat list, not the clauses themselves.
    for (const index of group.items) {
      const clause = termsAndConditions[index];
      if (clause) lines.push(`- ${clause}`);
    }
    lines.push("");
  }

  /**
   * Any clause the groups do not reference is emitted separately, so a newly
   * added term cannot silently drop out of this file.
   */
  const referenced = new Set(termsGroups.flatMap((group) => group.items));
  const unreferenced = termsAndConditions.filter(
    (_, index) => !referenced.has(index),
  );
  if (unreferenced.length) {
    lines.push("### بندهای تکمیلی", "");
    for (const item of unreferenced) lines.push(`- ${item}`);
    lines.push("");
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
        specification: true,
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
          `- متریال: ${dieline.materials}`,
          "",
        ].join("\n"),
      ),
    ].join("\n");
  } catch (error) {
    console.error("llms-full.txt: could not list dielines", error);
    return null;
  }
}
