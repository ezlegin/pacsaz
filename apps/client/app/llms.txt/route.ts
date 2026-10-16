import { FAQ_ITEMS } from "@/data/faq";
import { absoluteUrl, CONTACT, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
import { prisma } from "@repo/db";

/**
 * `/llms.txt` — the emerging convention for telling a language model what a site
 * is, what it offers and which URLs are worth reading, in one fetch.
 *
 * It is written as plain Markdown with absolute links because that is the format
 * the convention specifies, and generated per request so the catalogue section
 * lists what is actually published.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const body = await buildLlmsTxt();

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Readable, cacheable and never stale for more than an hour.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

async function buildLlmsTxt(): Promise<string> {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`, "");
  lines.push(`> ${SITE_TAGLINE}`, "");

  lines.push(
    `${SITE_NAME} یک ابزار آنلاین برای ساخت دایلاین (dieline) بسته‌بندی است.`,
    "کاربر ابعاد بسته را وارد می‌کند، متریال و ضخامت مقوا را انتخاب می‌کند و",
    "سامانه خطوط برش، تا و بلید را با محاسبات دقیق تولید می‌کند. خروجی‌ها",
    "DXF (برای ایلاستریتور و اتوکد)، PDF با اندازه واقعی و SVG هستند.",
    "",
    "دسترسی به کتابخانه قالب‌ها با اشتراک ماهانه، سه‌ماهه یا سالانه فراهم",
    "می‌شود؛ خروجی‌ها واترمارک ندارند.",
    "",
  );

  lines.push("## پاسخ‌های کوتاه به پرسش‌های پرتکرار", "");
  for (const item of FAQ_ITEMS) {
    lines.push(`- **${item.question}** ${item.answer}`);
  }
  lines.push("");

  lines.push("## صفحات کلیدی", "");
  const pages: { label: string; path: string; note: string }[] = [
    { label: "صفحه اصلی", path: "/", note: "معرفی ابزار و قابلیت‌ها" },
    {
      label: "کتابخانه قالب‌های دایلاین",
      path: "/dielines",
      note: "فهرست کامل قالب‌های آماده",
    },
    {
      label: "پلن‌ها و قیمت‌ها",
      path: "/subscription",
      note: "اشتراک ماهانه، سه‌ماهه و سالانه",
    },
    {
      label: "سوالات متداول",
      path: "/faq",
      note: "پاسخ تفصیلی پرسش‌ها",
    },
    { label: "درباره ما", path: "/about-us", note: "درباره تیم و محصول" },
    { label: "تماس با ما", path: "/contact-us", note: "راه‌های ارتباطی" },
    { label: "قوانین و مقررات", path: "/terms", note: "شرایط استفاده" },
  ];
  for (const page of pages) {
    lines.push(`- [${page.label}](${absoluteUrl(page.path)}): ${page.note}`);
  }
  lines.push("");

  const catalogue = await catalogueSection();
  if (catalogue) lines.push(catalogue);

  lines.push("## دسته‌بندی‌ها", "");
  const categories = await categorySection();
  if (categories) lines.push(categories);

  lines.push("## اطلاعات تماس", "");
  lines.push(`- ایمیل: ${CONTACT.email}`);
  lines.push(`- تلفن: ${CONTACT.telephone}`);
  lines.push("");
  lines.push("## اختیاری", "");
  lines.push(
    `- [نقشه سایت](${absoluteUrl("/sitemap.xml")}): فهرست کامل URL‌های قابل ایندکس`,
  );
  lines.push("");

  return lines.join("\n");
}

/**
 * The published dielines, capped so the file stays a reasonable fetch. Anything
 * beyond the cap is still discoverable through the sitemap.
 */
const CATALOGUE_LIMIT = 200;

async function catalogueSection(): Promise<string | null> {
  try {
    const dielines = await prisma.dieline.findMany({
      where: { active: true },
      select: { title: true, slug: true, specification: true },
      orderBy: { updatedAt: "desc" },
      take: CATALOGUE_LIMIT,
    });

    if (!dielines.length) return null;

    return [
      `## قالب‌های دایلاین منتشرشده (${dielines.length} مورد)`,
      "",
      ...dielines.map(
        (dieline) =>
          `- [${dieline.title}](${absoluteUrl(`/dieline/${dieline.slug}`)}): ${dieline.specification}`,
      ),
      "",
    ].join("\n");
  } catch (error) {
    console.error("llms.txt: could not list dielines", error);
    return null;
  }
}

async function categorySection(): Promise<string | null> {
  try {
    const [byModel, byUsage] = await Promise.all([
      prisma.dielineCategoryByModel.findMany({
        where: { dieline: { some: { active: true } } },
        select: { title: true, slug: true },
        orderBy: { title: "asc" },
      }),
      prisma.dielineCategoryByUsage.findMany({
        where: { dieline: { some: { active: true } } },
        select: { title: true, slug: true },
        orderBy: { title: "asc" },
      }),
    ]);

    const all = [...byModel, ...byUsage];
    if (!all.length) return null;

    return [
      ...all.map(
        (category) =>
          `- [${category.title}](${absoluteUrl(`/dielines/category/${category.slug}`)})`,
      ),
      "",
    ].join("\n");
  } catch (error) {
    console.error("llms.txt: could not list categories", error);
    return null;
  }
}
