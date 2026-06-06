import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import SubscriptionsList from "./SubscriptionsList";
import { pagination } from "@repo/lib/utils/pagination";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const plans = await prisma.plan.findMany({
    include: { user: true, payment: true },
    orderBy: { id: "desc" },
    skip,
    take,
  });
  const totalPlans = await prisma.plan.count();

  return (
    <div className="space-y-3">
      <PageTitle title="Subscriptions" />

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Search placeholder="Search By User" />
          <Filter
            options={[
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
            ]}
            name="status"
            placeholder="Sort By Status"
          />
        </div>
      </div>

      <SubscriptionsList data={plans} />

      <Pagination pageSize={globalPageSize} totalItems={totalPlans} />
    </div>
  );
};

export default page;
