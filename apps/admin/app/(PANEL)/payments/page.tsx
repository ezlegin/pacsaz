import PageTitle from "@/components/PageTitle";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import NewButton from "@repo/ui/components/custom/NewButton";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import PaymentsList from "./PaymentsList";
import { prisma } from "@repo/db";

const page = async () => {
  const payments = await prisma.payment.findMany({
    include: { plan: true, user: true, coupon: { include: { plan: true } } },
    orderBy: { id: "desc" },
  });

  return (
    <div className="space-y-3">
      <PageTitle title="Payments" />

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Search placeholder="Search By User" />
          <Filter
            options={[
              { label: "Failed", value: "failed" },
              { label: "Success", value: "success" },
              { label: "Canceled", value: "canceled" },
              { label: "Pending", value: "pending" },
            ]}
            name="status"
            placeholder="Sort By Status"
          />
        </div>

        <NewButton title="New Payment" href="/payments/new" />
      </div>

      <PaymentsList data={payments} />

      <Pagination pageSize={globalPageSize} totalItems={payments.length} />
    </div>
  );
};

export default page;
