import PageTitle from "@/components/PageTitle";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import CustomersList from "./CustomersList";
import Search from "@repo/ui/components/custom/Search";
import { prisma } from "@repo/db";

const page = async () => {
  const customers = await prisma.customer.findMany({ include: { user: true } });
  return (
    <div className="space-y-3">
      <PageTitle title="Customers" />

      <div className="flex justify-between">
        <Search placeholder="Search Customers" />
      </div>

      <CustomersList data={customers} />

      <Pagination pageSize={globalPageSize} totalItems={customers.length} />
    </div>
  );
};

export default page;
