import Filter from "@/components/Filter";
import PageTitle from "@/components/PageTitle";
import PopupNewDialog from "@/components/PopupNewDialog";
import Search from "@/components/Search";
import { SubscriptionForm } from "@/components/forms/SubscriptionForm";
import { globalPageSize } from "@/lib/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import { addMonths, addYears } from "date-fns";
import SubscriptionsList, { Subscription } from "./SubscriptionsList";

const page = () => {
  return (
    <div className="space-y-3">
      <PageTitle title="Subscriptions" />

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Search placeholder="Search By User" />
          <Filter
            options={[
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
            ]}
            name="status"
            placeholder="Sort By Status"
          />
        </div>

        <PopupNewDialog buttonTitle="New">
          <SubscriptionForm />
        </PopupNewDialog>
      </div>

      <SubscriptionsList data={data} />

      <Pagination pageSize={globalPageSize} totalItems={data.length} />
    </div>
  );
};

export default page;

const data: Subscription[] = [
  {
    id: 1,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    startedAt: new Date("2026-01-13"),
    endsAt: addMonths(new Date(), 1),
    plan: { key: "standard", level: 1, period: "monthly" },
    downloads: {
      fair: 90,
      downloaded: 30,
    },
  },
  {
    id: 2,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    startedAt: new Date("2026-01-13"),
    endsAt: addMonths(new Date(), 1),
    plan: { key: "pro", level: 2, period: "3-month" },
    downloads: {
      fair: 90,
      downloaded: 30,
    },
  },
  {
    id: 3,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    startedAt: new Date("2026-01-13"),
    endsAt: addMonths(new Date(), 1),
    plan: { key: "organization", level: 3, period: "annual" },
    downloads: {
      fair: 90,
      downloaded: 30,
    },
  },
  {
    id: 4,
    user: { fullName: "علیرضا ازلگینی", phoneNumber: "09127452859" },
    startedAt: new Date("2025-01-13"),
    endsAt: addYears(new Date("2025-01-13"), 1),
    plan: { key: "organization", level: 3, period: "annual" },
    downloads: {
      fair: 90,
      downloaded: 30,
    },
  },
];
