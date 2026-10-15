import DielinesGrid from "@/components/DielinesGrid";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { Heart, Layers, Search } from "lucide-react";
import {
  EmptyState,
  PanelPage,
  PageHeader,
  PanelCard,
  StatTile,
} from "../components/PanelUI";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const PAGE_SIZE = 40;

interface Props {
  searchParams: Promise<{ page: string }>;
}

const FavsPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, PAGE_SIZE);

  const user = await getSessionUser();
  const where = { userId: user?.id };

  const [favs, totalFavs, withModelImage, categoryCount] = await Promise.all([
    prisma.favedDieline.findMany({
      where,
      include: {
        dieline: { include: { dielineImage: true, modelImage: true } },
      },
      skip,
      take,
    }),
    prisma.favedDieline.count({ where }),
    prisma.favedDieline.count({
      where: { ...where, dieline: { modelImage: { isNot: null } } },
    }),
    prisma.dielineCategoryByUsage.count(),
  ]);

  const dielines = favs.map((f) => f.dieline);

  return (
    <PanelPage>
      <PageHeader
        icon={Heart}
        title="علاقه‌مندی‌ها"
        description="قالب‌هایی که نشان کرده‌ای تا بعداً سریع پیدایشان کنی."
        actions={
          <Link
            href="/dielines"
            className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Search className="size-3.5" />
            جستجو در کتابخانه
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Heart}
          label="قالب‌های نشان‌شده"
          value={`${fa(totalFavs)} مورد`}
          tone="primary"
        />
        <StatTile
          icon={Layers}
          label="با پیش‌نمایش مدل"
          value={`${fa(withModelImage)} مورد`}
          hint="تصویر سه‌بعدی دارند"
        />
        <StatTile
          icon={Layers}
          label="دسته‌بندی کتابخانه"
          value={`${fa(categoryCount)} دسته`}
          hint="همه در دسترس تو"
        />
      </div>

      {dielines.length === 0 ? (
        <PanelCard>
          <EmptyState
            icon={Heart}
            title="هنوز قالبی را نشان نکرده‌ای"
            description="در کتابخانه‌ی قالب‌ها روی آیکن قلب بزن تا قالب‌های مورد علاقه‌ات اینجا جمع شوند."
            action={
              <Link
                href="/dielines"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
              >
                مشاهده قالب‌ها
              </Link>
            }
          />
        </PanelCard>
      ) : (
        <>
          <DielinesGrid dielines={dielines} />
          <Pagination
            pageSize={PAGE_SIZE}
            totalItems={totalFavs}
            lang="fa"
          />
        </>
      )}
    </PanelPage>
  );
};

export default FavsPage;

export const metadata = {
  title: "علاقه مندی ها",
};
