import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import { contains, searchText } from "@/lib/listQuery";
import { Prisma, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { UserCheck } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import CustomersList from "./CustomersList";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page, search } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);
  const q = searchText(search);

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { fullName: contains(q) },
          { email: contains(q) },
          { phoneNumber: { contains: q } },
          { user: { fullName: contains(q) } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <Page>
      <PageHeader
        icon={UserCheck}
        title="Customers"
        description="Contacts that users keep in their own panel for the dielines they make."
      />

      <Search placeholder="Search customer or user" className="max-w-sm" />

      <CustomersList data={customers} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;
