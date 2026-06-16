import { AdminForm } from "@/components/forms/AdminForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import AdminsList from "./AdminsList";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, globalPageSize);
  const admins = await prisma.admin.findMany({
    orderBy: { id: "desc" },
    skip,
    take,
  });
  const totalUsers = await prisma.admin.count();

  // todo: sorting and searching

  return (
    <div className="space-y-3">
      <PageTitle title="Admins" />

      <div className="flex justify-between">
        <Search placeholder="Search Admins" />

        <PopupNewDialog buttonTitle="New Admin">
          <DialogTitle>New Admin</DialogTitle>
          <AdminForm />
        </PopupNewDialog>
      </div>

      <AdminsList data={admins} />

      <Pagination pageSize={globalPageSize} totalItems={totalUsers} />
    </div>
  );
};

export default page;
