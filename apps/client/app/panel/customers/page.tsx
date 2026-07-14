import { CustomerForm } from "@/components/forms/CustomerForm";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import CustomersList from "./CustomersList";
import { pagination } from "@repo/lib/utils/pagination";
import { getSessionUser } from "@repo/auth/session";
import { Badge } from "@repo/ui/components/badge";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const user = await getSessionUser();
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);

  const where = { userId: user?.id };
  const customers = await prisma.customer.findMany({
    where,
    skip,
    take,
  });

  const totalCustomers = await prisma.customer.count({ where });

  if (!user?.plan?.isPremium)
    return <Badge variant={"lightRed"}>فقط در اشتراک حرفه ای و سازمانی</Badge>;

  // todo: searching

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Search placeholder="جستجو..." />

        <PopupNewDialog buttonTitle="مشتری جدید" icon>
          <DialogTitle>مشتری جدید</DialogTitle>
          <CustomerForm type="create" />
        </PopupNewDialog>
      </div>
      <CustomersList data={customers} />

      <Pagination
        pageSize={globalPageSize}
        totalItems={totalCustomers}
        lang="fa"
      />
    </div>
  );
};

export default page;

export const metadata = {
  title: "مشتری ها",
};
