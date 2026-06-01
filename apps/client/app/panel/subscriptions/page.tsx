import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import SubscriptionsList from "./SuscriptionsList";
import { prisma } from "@repo/db";
import { getSessionUser } from "@repo/auth/session";

const page = async () => {
  const user = await getSessionUser();
  const payments = await prisma.plan.findMany({
    where: { userId: user?.id },
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

export const metadata = {
  title: "سوابق اشتراک",
};
