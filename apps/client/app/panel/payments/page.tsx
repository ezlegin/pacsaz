import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PaymentsList from "./PaymentsList";
import { prisma } from "@repo/db";

const page = async () => {
  const payments = await prisma.payment.findMany({
    where: { userId: 1, status: { not: "could_not_initiate" } },
    include: { plan: true },
    orderBy: { id: "desc" },
  });

  return (
    <div className="space-y-3">
      <PaymentsList data={payments} />
      <Pagination
        pageSize={globalPageSize}
        totalItems={payments.length}
        lang="fa"
      />
    </div>
  );
};

export default page;
