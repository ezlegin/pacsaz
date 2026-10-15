import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@/components/Pagination";
import PaymentsList from "./PaymentsList";
import { PaymentWhereInput, prisma } from "@repo/db";
import { getSessionUser } from "@repo/auth/session";
import { pagination } from "@repo/lib/utils/pagination";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import { CreditCard, Receipt, Wallet } from "lucide-react";
import { PanelPage, PageHeader, StatTile } from "../components/PanelUI";

const fa = (value: number) =>
  Math.round(value).toLocaleString("fa-IR", { useGrouping: false });

interface Props {
  searchParams: Promise<{ page: string }>;
}

const PaymentsPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const user = await getSessionUser();

  const where: PaymentWhereInput = {
    userId: user?.id,
    status: { not: "could_not_initiate" },
  };

  const [payments, totalPayments, successAgg, failedCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { plan: true },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { userId: user?.id, status: "success" },
      _sum: { total: true },
    }),
    prisma.payment.count({
      where: { userId: user?.id, status: "failed" },
    }),
  ]);

  return (
    <PanelPage>
      <PageHeader
        icon={Receipt}
        title="پرداخت‌ها"
        description="همه‌ی تراکنش‌های اشتراک، با مبلغ، تخفیف و وضعیت نهایی هر پرداخت."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Wallet}
          label="مجموع پرداخت موفق"
          value={`${formatPrice(successAgg._sum.total ?? 0, false, "fa")} تومان`}
          hint="از ابتدای عضویت"
          tone="primary"
        />
        <StatTile
          icon={CreditCard}
          label="تعداد تراکنش‌ها"
          value={`${fa(totalPayments)} تراکنش`}
          hint="بدون احتساب خطای درگاه"
        />
        <StatTile
          icon={Receipt}
          label="تراکنش ناموفق"
          value={`${fa(failedCount)} مورد`}
          hint={failedCount > 0 ? "جزئیات را در جدول ببین" : "همه‌ی پرداخت‌ها موفق"}
          tone={failedCount > 0 ? "warning" : "plain"}
        />
      </div>

      <PaymentsList data={payments} />

      <Pagination
        pageSize={globalPageSize}
        totalItems={totalPayments}
        lang="fa"
      />
    </PanelPage>
  );
};

export default PaymentsPage;

export const metadata = {
  title: "پرداخت ها",
};
