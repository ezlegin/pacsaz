import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@repo/ui/components/custom/Pagination";
import SubscriptionsList from "./SuscriptionsList";
import { globalPageSize } from "@repo/lib/data/consts";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;

  const user = await getSessionUser();
  const { skip, take } = pagination(page, globalPageSize);

  const where = { userId: user?.id };

  const plans = await prisma.plan.findMany({
    where,
    include: { payment: true },
    orderBy: { id: "desc" },
    take,
    skip,
  });

  const totalPlans = await prisma.plan.count({ where });

  return (
    <div className="space-y-3">
      <SubscriptionsList data={plans} />
      <Pagination pageSize={globalPageSize} totalItems={totalPlans} lang="fa" />
    </div>
  );
};

export default page;

export const metadata = {
  title: "سوابق اشتراک",
  description:
    "صفحه سوابق اشتراک در وبسایت پکساز. اطلاعات مربوط به اشتراک‌های شما در این صفحه نمایش داده می‌شود.",
};
