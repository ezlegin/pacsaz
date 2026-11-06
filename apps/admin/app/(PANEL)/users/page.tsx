import { UserForm } from "@/components/forms/UserForm";
import Pagination from "@/components/Pagination";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { contains, searchText } from "@/lib/listQuery";
import { Prisma, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { DialogTitle } from "@repo/ui/components/dialog";
import { Users } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import UsersList from "./UsersList";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page, search } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);
  const q = searchText(search);

  const where: Prisma.UserWhereInput = q
    ? { OR: [{ fullName: contains(q) }, { email: contains(q) }, { phoneNumber: { contains: q } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { joinedAt: "desc" }, skip, take }),
    prisma.user.count({ where }),
  ]);

  return (
    <Page>
      <PageHeader
        icon={Users}
        title="Users"
        description={`${total} customer account${total === 1 ? "" : "s"}. Open one to see its subscriptions, payments and downloads.`}
        actions={
          <PopupNewDialog buttonTitle="New user">
            <DialogTitle>New user</DialogTitle>
            <UserForm />
          </PopupNewDialog>
        }
      />

      <Search placeholder="Search name, email or phone" className="max-w-sm" />

      <UsersList data={users} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;
