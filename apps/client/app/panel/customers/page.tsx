import { CustomerForm } from "@/components/forms/CustomerForm";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import CustomersList from "./CustomersList";
import { Customer } from "@repo/db";

const page = () => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Search placeholder="جستجو..." />

        <PopupNewDialog buttonTitle="مشتری جدید" icon>
          <CustomerForm type="create" />
        </PopupNewDialog>
      </div>
      <CustomersList data={data} />

      <Pagination pageSize={globalPageSize} totalItems={30} lang="fa" />
    </div>
  );
};

export default page;

const data: Customer[] = [
  {
    id: 1,
    fullName: "علیرضا ازلیگنی",
    address: "زنجان، خیابان فردوسی، کوچه نسترن اول، پلاک 46",
    email: "ezlegini.ir@gmail.com",
    phoneNumber: "09127452859",
  },
  {
    id: 2,
    fullName: "فاطمه احمدی",
    address: "زنجان، خیابان فردوسی، کوچه نسترن اول، پلاک 46",
    email: "fa.ahmdi03@gmail.com",
    phoneNumber: "09392563627",
  },
];
