import { UserForm } from "@/components/forms/UserForm";
import PageTitle from "@/components/PageTitle";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { globalPageSize } from "@/lib/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import UsersList from "./UsersList";

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

const data = [
  {
    id: 1,
    fullName: "علیرضا ازلگینی",
    phoneNumber: "09127452859",
    email: "ezlegini.ir@gmail.com",
    joinedAt: new Date(),
  },
];
