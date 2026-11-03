import CustomizeEditor from "@/components/product/CustomizeEditor";
import { canCustomize } from "@/lib/dieline/access";
import { loadTemplate } from "@/lib/dieline/engine";
import Diamond from "@/public/icons/Diamond";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { customizeOptions } from "@repo/dieline-engine";
import { Button } from "@repo/ui/components/button";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export const metadata: Metadata = {
  title: "ویرایش پیشرفته‌ی قالب",
  // A per-user editor: nothing here for search engines.
  robots: { index: false, follow: false },
};

/**
 * Customize mode: the paid editor for a customer's own copy of a template.
 * The page decides who may enter; every save and download is checked again by
 * the server actions.
 */
export default async function CustomizePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { saved: savedId } = await searchParams;

  const dieline = await prisma.dieline.findFirst({
    where: { slug, active: true },
    include: { settings: true, dielineImage: true, modelImage: true },
  });
  if (!dieline) notFound();

  const template = loadTemplate(dieline.specification);
  if (!template || !customizeOptions(template).any) {
    return (
      <Notice title="این قالب ویرایش پیشرفته ندارد" text="برای این قالب فقط تغییر ابعاد و متریال ممکن است.">
        <Link href={`/dieline/${slug}`}>
          <Button variant="outline">بازگشت به قالب</Button>
        </Link>
      </Notice>
    );
  }

  const user = await getSessionUser();
  if (!user) {
    return (
      <Notice title="ابتدا وارد شوید" text="ویرایش پیشرفته‌ی قالب برای کاربران اشتراک حرفه‌ای و سازمانی در دسترس است.">
        <Link href={`/login?callbackUrl=/dieline/${slug}/customize`}>
          <Button variant="gradient">ورود به حساب</Button>
        </Link>
      </Notice>
    );
  }

  if (!canCustomize(user.plan)) {
    return (
      <Notice
        title="ویرایش پیشرفته، ویژه‌ی اشتراک حرفه‌ای"
        text="بال‌ها و درب‌ها را عوض کنید، پنجره و سوراخ آویز اضافه کنید و گزینه‌های طراح قالب را تنظیم کنید؛ همه با بررسی خودکار قابلیت تولید."
      >
        <Link href="/subscription">
          <Button variant="gradient">
            <Diamond /> مشاهده‌ی اشتراک‌ها
          </Button>
        </Link>
      </Notice>
    );
  }

  const saved = savedId
    ? await prisma.savedDieline.findFirst({
        where: { id: Number(savedId) || 0, userId: user.id, dielineId: dieline.id },
        include: { settings: true },
      })
    : null;

  return <CustomizeEditor dieline={dieline} template={template} user={user} saved={saved} />;
}

function Notice({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md space-y-4 rounded-3xl border bg-background p-8 text-center shadow-sm">
        <p className="text-lg font-extrabold">{title}</p>
        <p className="text-sm leading-7 text-muted-foreground">{text}</p>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}
