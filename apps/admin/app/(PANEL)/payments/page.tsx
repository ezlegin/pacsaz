import { PaymentForm } from "@/components/forms/PaymentForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Filter from "@repo/ui/components/custom/Filter";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import PaymentsList from "./PaymentsList";

const page = async () => {
  const payments = await prisma.payment.findMany({
    include: { plan: true, user: true, coupon: { include: { tarrif: true } } },
    orderBy: { id: "desc" },
  });
  const tarrif = await prisma.tarrif.findMany({ include: { price: true } });

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

        <PopupNewDialog buttonTitle="New Payment">
          <DialogTitle>New Payment</DialogTitle>
          <PaymentForm tarrif={tarrif} />
        </PopupNewDialog>
      </div>

      <PaymentsList data={payments} tarrif={tarrif} />

      <Pagination pageSize={globalPageSize} totalItems={payments.length} />
    </div>
  );
};

export default page;
