import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PaymentsList from "./PaymentsList";
import { PaymentWhereInput, prisma } from "@repo/db";
import { getSessionUser } from "@repo/auth/session";
import { pagination } from "@repo/lib/utils/pagination";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const user = await getSessionUser();

  const where: PaymentWhereInput = {
    userId: user?.id,
    status: { not: "could_not_initiate" },
  };

  const payments = await prisma.payment.findMany({
    where,
    include: { plan: true },
    orderBy: { id: "desc" },
    skip,
    take,
  });

  const totalPayments = await prisma.payment.count({ where });

  return (
    <div className="space-y-3">
      <PaymentsList data={payments} />
      <Pagination
        pageSize={globalPageSize}
        totalItems={totalPayments}
        lang="fa"
      />
    </div>
  );
};

export default page;

export const metadata = {
  title: "پرداخت ها",
};
