import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@/components/Pagination";
import SubscriptionsList from "./SuscriptionsList";
import { globalPageSize } from "@repo/lib/data/consts";
import { CheckCircle2, Download, Flag } from "lucide-react";
import { PanelPage, PageHeader, StatTile } from "../components/PanelUI";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

interface Props {
  searchParams: Promise<{ page: string }>;
}

const SubscriptionsPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams;

  const user = await getSessionUser();
  const { skip, take } = pagination(page, globalPageSize);

  const where = { userId: user?.id };

  const [plans, totalPlans, totalDownloads, activeCount] = await Promise.all([
    prisma.plan.findMany({
      where,
      include: { payment: true },
      orderBy: { id: "desc" },
      take,
      skip,
    }),
    prisma.plan.count({ where }),
    prisma.plan.aggregate({ where, _sum: { downloaded: true } }),
    prisma.plan.count({
      where: { ...where, status: "active", endsAt: { gt: new Date() } },
    }),
  ]);

  return (
    <PanelPage>
      <PageHeader
        icon={Flag}
        title="سوابق اشتراک"
        description="همه‌ی پلن‌هایی که تا امروز فعال کرده‌ای، همراه با سهمیه و وضعیت هرکدام."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Flag}
          label="کل اشتراک‌ها"
          value={`${fa(totalPlans)} پلن`}
          hint="از ابتدای عضویت"
        />
        <StatTile
          icon={CheckCircle2}
          label="اشتراک فعال"
          value={`${fa(activeCount)} پلن`}
          hint={activeCount > 0 ? "در حال استفاده" : "اشتراک فعالی نداری"}
          tone={activeCount > 0 ? "primary" : "plain"}
        />
        <StatTile
          icon={Download}
          label="مجموع دانلودها"
          value={`${fa(totalDownloads._sum.downloaded ?? 0)} قالب`}
          hint="روی همه‌ی پلن‌ها"
        />
      </div>

      <SubscriptionsList data={plans} />

      <Pagination pageSize={globalPageSize} totalItems={totalPlans} lang="fa" />
    </PanelPage>
  );
};

export default SubscriptionsPage;

export const metadata = {
  title: "سوابق اشتراک",
  description:
    "صفحه سوابق اشتراک در وبسایت پکساز. اطلاعات مربوط به اشتراک‌های شما در این صفحه نمایش داده می‌شود.",
};
