import { CustomerForm } from "@/components/forms/CustomerForm";
import { prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PopupNewDialog from "@repo/ui/components/custom/PopupNewDialog";
import Search from "@repo/ui/components/custom/Search";
import { DialogTitle } from "@repo/ui/components/dialog";
import CustomersList from "./CustomersList";

const page = async () => {
  const customers = await prisma.customer.findMany();

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
        totalItems={customers.length}
        lang="fa"
      />
    </div>
  );
};

export default page;
