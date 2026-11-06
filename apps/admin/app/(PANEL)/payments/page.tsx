import { PaymentForm } from "@/components/forms/PaymentForm";
import Filter from "@/components/Filter";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { contains, pick, searchText } from "@/lib/listQuery";
import { paymentStatus } from "@/lib/validationSchema/validatoinSchema";
import { Prisma, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { DialogTitle } from "@repo/ui/components/dialog";
import { CreditCard } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import PaymentsList from "./PaymentsList";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string; method?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page, search, status, method } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);
  const q = searchText(search);
  const byStatus = pick(status, paymentStatus);
  const byMethod = pick(method, ["admin", "zarinPal", "no_method"] as const);

  const where: Prisma.PaymentWhereInput = {
    ...(q
      ? {
          OR: [
            { user: { fullName: contains(q) } },
            { user: { email: contains(q) } },
            { user: { phoneNumber: { contains: q } } },
            { discountCode: contains(q) },
            { authority: { contains: q } },
          ],
        }
      : {}),
    ...(byStatus ? { status: byStatus } : {}),
    ...(byMethod ? { method: byMethod } : {}),
  };

  const [payments, total, tarrif] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { plan: true, user: true, coupon: { include: { tarrif: true } } },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.payment.count({ where }),
    prisma.tarrif.findMany({ include: { price: true } }),
  ]);

  return (
    <Page>
      <PageHeader
        icon={CreditCard}
        title="Payments"
        description="Every payment and the subscription it grants. A payment added here is priced from the tariff; only a successful one makes the subscription active."
        actions={
          <PopupNewDialog buttonTitle="New payment">
            <DialogTitle>New payment</DialogTitle>
            <PaymentForm tarrif={tarrif} />
          </PopupNewDialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Search placeholder="Search user, code or authority" className="w-72" />
        <Filter
          name="status"
          placeholder="All statuses"
          options={[
            { label: "Success", value: "success" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Canceled", value: "canceled" },
            { label: "Could not start", value: "could_not_initiate" },
          ]}
        />
        <Filter
          name="method"
          placeholder="All methods"
          options={[
            { label: "ZarinPal", value: "zarinPal" },
            { label: "Added by admin", value: "admin" },
          ]}
        />
      </div>

      <PaymentsList data={payments} tarrif={tarrif} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;
