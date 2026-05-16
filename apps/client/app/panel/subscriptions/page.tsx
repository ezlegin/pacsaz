import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import SubscriptionsList from "./SuscriptionsList";
import { prisma } from "@repo/db";

const page = async () => {
  const payments = await prisma.plan.findMany({
    where: { userId: 1 },
    include: { payment: true },
    orderBy: { id: "desc" },
  });

  return (
    <div className="space-y-3">
      <SubscriptionsList data={payments} />
      <Pagination
        pageSize={globalPageSize}
        totalItems={payments.length}
        lang="fa"
      />
    </div>
  );
};

export default page;
