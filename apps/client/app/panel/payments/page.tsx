import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import PaymentsList from "./PaymentsList";

const page = () => {
  return (
    <div className="space-y-3">
      <PaymentsList data={data} />
      <Pagination
        pageSize={globalPageSize}
        totalItems={data.length}
        lang="fa"
      />
    </div>
  );
};

export default page;

const data = [
  {
    id: 1,
    date: new Date("2026-01-01"),
    status: "success",
    amount: 399000,
    plan: "standard",
    period: "monthly",
  },
  {
    id: 2,
    date: new Date("2026-01-01"),
    status: "failed",
    amount: 399000,
    plan: "standard",
    period: "monthly",
  },
  {
    id: 3,
    date: new Date("2026-01-01"),
    status: "canceled",
    amount: 399000,
    plan: "standard",
    period: "monthly",
  },
  {
    id: 4,
    date: new Date("2026-01-01"),
    status: "pending",
    amount: 399000,
    plan: "standard",
    period: "monthly",
  },
];
