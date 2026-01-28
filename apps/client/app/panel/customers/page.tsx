import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import CustomersList from "./CustomersList";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { globalPageSize } from "@repo/lib/data/consts";
import Search from "@repo/ui/components/custom/Search";
import Pagination from "@repo/ui/components/custom/Pagination";

const page = () => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Search placeholder="جستجو..." />

        <PopupNewDialog buttonTitle="مشتری جدید" icon>
          <CustomerForm />
        </PopupNewDialog>
      </div>
      <CustomersList />

      <Pagination pageSize={globalPageSize} totalItems={30} lang="fa" />
    </div>
  );
};

export default page;
