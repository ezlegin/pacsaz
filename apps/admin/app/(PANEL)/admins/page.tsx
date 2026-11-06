import { AdminForm } from "@/components/forms/AdminForm";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { contains, searchText } from "@/lib/listQuery";
import { requireAdmin } from "@/lib/session";
import { Prisma, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { DialogTitle } from "@repo/ui/components/dialog";
import { ShieldCheck } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import AdminsList from "./AdminsList";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const me = await requireAdmin();
  const { page, search } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);
  const q = searchText(search);

  const where: Prisma.AdminWhereInput = q
    ? { OR: [{ fullName: contains(q) }, { email: contains(q) }, { phoneNumber: { contains: q } }] }
    : {};

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      // Never the password hash: these rows are passed to client components.
      select: { id: true, fullName: true, email: true, phoneNumber: true },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.admin.count({ where }),
  ]);

  return (
    <Page>
      <PageHeader
        icon={ShieldCheck}
        title="Admins"
        description="Staff accounts that can sign in to this panel."
        actions={
          <PopupNewDialog buttonTitle="New admin">
            <DialogTitle>New admin</DialogTitle>
            <AdminForm />
          </PopupNewDialog>
        }
      />

      <Search placeholder="Search name, email or phone" className="max-w-sm" />

      <AdminsList data={admins} currentAdminId={me.id} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;
