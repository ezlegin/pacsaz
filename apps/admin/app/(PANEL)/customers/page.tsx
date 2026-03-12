import PageTitle from "@/components/PageTitle";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import CustomersList from "./CustomersList";
import Search from "@repo/ui/components/custom/Search";

export type Customer = {
  id: number;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
};

const page = () => {
  return (
    <div className="space-y-3">
      <PageTitle title="Customers" />

      <div className="flex justify-between">
        <Search placeholder="Search Customers" />
      </div>

      <CustomersList data={data} />

      <Pagination pageSize={globalPageSize} totalItems={data.length} />
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
