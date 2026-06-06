import PageTitle from "@/components/PageTitle";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import CustomersList from "./CustomersList";
import Search from "@repo/ui/components/custom/Search";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const customers = await prisma.customer.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  const totalCustomers = await prisma.customer.count();

  return (
    <div className="space-y-3">
      <PageTitle title="Customers" />

      <div className="flex justify-between">
        <Search placeholder="Search Customers" />
      </div>

      <CustomersList data={customers} />

      <Pagination pageSize={globalPageSize} totalItems={totalCustomers} />
    </div>
  );
};

export default page;
