import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import CustomersList from "./CustomersList";
import { CustomerForm } from "@/components/forms/CustomerForm";
import Pagination from "@repo/ui/components/custom/Pagination";
import { globalPageSize } from "@/data/consts";

const page = () => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <div />
        {/* //todo: add search and sorting */}
        <PopupNewDialog buttonTitle="مشتری جدید" icon>
          <CustomerForm />
        </PopupNewDialog>
      </div>
      <CustomersList />

      <Pagination pageSize={globalPageSize} totalItems={30} dir="rtl" />
    </div>
  );
};

export default page;
