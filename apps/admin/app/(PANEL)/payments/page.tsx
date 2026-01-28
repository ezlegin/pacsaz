import PageTitle from "@/components/PageTitle";
import Pagination from "@repo/ui/components/custom/Pagination";
import PaymentsList, { Payment } from "./PaymentsList";
import { globalPageSize } from "@repo/lib/data/consts";
import NewButton from "@repo/ui/components/custom/NewButton";
import Filter from "@repo/ui/components/custom/Filter";
import Search from "@repo/ui/components/custom/Search";

const page = () => {
  return (
    <div className="space-y-3">
      <PageTitle title="Payments" />

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Search placeholder="Search By User" />
          <Filter
            options={[
              { label: "Failed", value: "failed" },
              { label: "Success", value: "success" },
              { label: "Canceled", value: "canceled" },
              { label: "Pending", value: "pending" },
            ]}
            name="status"
            placeholder="Sort By Status"
          />
        </div>

        <NewButton title="New Payment" href="/payments/new" />
      </div>

      <PaymentsList data={data} />

      <Pagination pageSize={globalPageSize} totalItems={data.length} />
    </div>
  );
};

export default page;

const data: Payment[] = [
  {
    id: 1,
    amount: 699000,
    discount: { amount: 100000, code: "pacsaz" },
    status: "success",
    total: 599000,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    plan: {
      key: "standard",
      level: 1,
      period: "monthly",
    },
  },
  {
    id: 2,
    amount: 699000,
    status: "failed",
    total: 699000,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    plan: {
      key: "pro",
      level: 1,
      period: "3-month",
    },
  },
  {
    id: 3,
    amount: 699000,
    discount: { amount: 100000, code: "pacsaz" },
    status: "pending",
    total: 599000,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    plan: {
      key: "organization",
      level: 1,
      period: "annual",
    },
  },
  {
    id: 4,
    amount: 699000,
    discount: { amount: 100000, code: "pacsaz" },
    status: "canceled",
    total: 599000,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    plan: {
      key: "organization",
      level: 1,
      period: "3-month",
    },
  },
];
