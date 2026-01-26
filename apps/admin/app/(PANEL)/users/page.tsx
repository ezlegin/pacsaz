import { UserForm } from "@/components/forms/UserForm";
import PageTitle from "@/components/PageTitle";
import Search from "@/components/Search";
import Pagination from "@repo/ui/components/custom/Pagination";
import UsersList from "./UsersList";
import { globalPageSize } from "@repo/lib/data/consts";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import { User } from "@repo/store/app/user.store";

const page = () => {
  return (
    <div className="space-y-3">
      <PageTitle title="Users" />

      <div className="flex justify-between">
        <Search placeholder="Search Users" />

        <PopupNewDialog buttonTitle="New User">
          <UserForm />
        </PopupNewDialog>
      </div>

      <UsersList data={data} />

      <Pagination pageSize={globalPageSize} totalItems={data.length} />
    </div>
  );
};

export default page;

const data: User[] = [
  {
    id: 1,
    fullName: "علیرضا ازلگینی",
    phoneNumber: "09127452859",
    email: "ezlegini.ir@gmail.com",
    joinedAt: new Date(),
    plan: null,
  },
];
