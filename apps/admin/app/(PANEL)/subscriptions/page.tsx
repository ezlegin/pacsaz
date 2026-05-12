import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import SubscriptionsList from "./SubscriptionsList";

const page = async () => {
  const plans = await prisma.plan.findMany({
    include: { user: true, payment: true },
    orderBy: { id: "desc" },
  });

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

      <Pagination pageSize={globalPageSize} totalItems={plans.length} />
    </div>
  );
};

export default page;
