import Filter from "@/components/Filter";
import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import { contains, pick, searchText } from "@/lib/listQuery";
import { planKey } from "@/lib/validationSchema/validatoinSchema";
import { Prisma, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import { Flag } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";
import SubscriptionsList from "./SubscriptionsList";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string; plan?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page, search, status, plan } = await searchParams;
  const { skip, take } = pagination(page ?? "", globalPageSize);
  const q = searchText(search);
  const state = pick(status, ["active", "expired", "inactive"] as const);
  const key = pick(plan, planKey);
  const now = new Date();

  // The same three states `getPlanState` shows, as database filters.
  const byState: Record<NonNullable<typeof state>, Prisma.PlanWhereInput> = {
    active: { status: "active", endsAt: { gte: now } },
    expired: { status: "active", endsAt: { lt: now } },
    inactive: { status: "inActive" },
  };

  const where: Prisma.PlanWhereInput = {
    ...(q
      ? {
          user: {
            OR: [{ fullName: contains(q) }, { email: contains(q) }, { phoneNumber: { contains: q } }],
          },
        }
      : {}),
    ...(state ? byState[state] : {}),
    ...(key ? { key } : {}),
  };

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      include: { user: true, payment: true },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    prisma.plan.count({ where }),
  ]);

  return (
    <Page>
      <PageHeader
        icon={Flag}
        title="Subscriptions"
        description="Customer plans. Use the row menu to extend a plan, switch it on or off, or give back its downloads."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Search placeholder="Search by user" className="w-64" />
        <Filter
          name="status"
          placeholder="All statuses"
          options={[
            { label: "Active", value: "active" },
            { label: "Expired", value: "expired" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
        <Filter
          name="plan"
          placeholder="All plans"
          options={[
            { label: "Standard", value: "standard" },
            { label: "Pro", value: "pro" },
            { label: "Organization", value: "organization" },
          ]}
        />
      </div>

      <SubscriptionsList data={plans} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;
