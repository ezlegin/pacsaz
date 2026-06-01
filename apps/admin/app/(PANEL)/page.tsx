import MostDielinesList from "@/components/MostDielinesList";
import PageTitle from "@/components/PageTitle";
import TitleIndicator from "@/components/TitleIndicator";
import { PlanPeriod, prisma } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import Card from "@repo/ui/components/custom/Card";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

const page = async () => {
  const activeSubs = await prisma.plan.findMany({
    where: { status: "active", endsAt: { gt: new Date() } },
    select: { period: true },
  });

  const thisMonthRevenue = await prisma.payment.aggregate({
    where: {
      status: "success",
      updatedAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
    _sum: {
      total: true,
    },
  });

  const lastMonthRevenue = await prisma.payment.aggregate({
    where: {
      status: "success",
      updatedAt: {
        gte: startOfMonth(subMonths(new Date(), 1)),
        lte: endOfMonth(subMonths(new Date(), 1)),
      },
    },
    _sum: {
      total: true,
    },
  });

  function getActiveCount(period: PlanPeriod) {
    return activeSubs.filter((s) => s.period === period).length;
  }

  const subscriptionsData = [
    { label: "Actives", value: activeSubs.length, primaryTheme: true },
    { label: "Monthly", value: getActiveCount("monthly") },
    { label: "3-month", value: getActiveCount("threeMonth") },
    { label: "Annual", value: getActiveCount("annual") },
  ];

  const revenueData = [
    {
      label: "This Month",
      value: formatPrice(thisMonthRevenue._sum.total ?? 0, true, "en"),
      primaryTheme: true,
    },
    {
      label: "Last Month",
      value: formatPrice(lastMonthRevenue._sum.total ?? 0, true, "en"),
    },
  ];

  const DielinesData = [
    { label: "Most Downloaded", data: [] },
    { label: "Most Viewd", data: [] },
    { label: "Most Faved", data: [] },
    { label: "Most Saved", data: [] },
  ];

  return (
    <div className="space-y-8">
      <div>
        <PageTitle title="Subscriptions" />
        <div className="grid grid-cols-4 gap-5">
          {subscriptionsData.map((i, idx) => (
            <StatCard
              key={idx}
              label={i.label}
              value={i.value}
              primaryTheme={i.primaryTheme}
            />
          ))}
        </div>
      </div>

      <div>
        <PageTitle title="Revenue" />
        <div className="grid grid-cols-4 gap-6">
          {revenueData.map((i, idx) => (
            <StatCard
              key={idx}
              label={i.label}
              value={i.value}
              primaryTheme={i.primaryTheme}
            />
          ))}
        </div>
      </div>

      <div>
        <PageTitle title="Dielines" />
        <div className="grid grid-cols-4 gap-5">
          {DielinesData.map((i, idx) => (
            <DielinesCard data={i.data} label={i.label} key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;

const StatCard = ({
  value,
  label,
  primaryTheme,
}: {
  label: string;
  value: number | string;
  primaryTheme?: boolean;
}) => {
  return (
    <Card
      primaryTheme={primaryTheme}
      className="flex justify-between items-center text-sm py-4"
    >
      <span className="text-base font-medium">{label}</span>
      <span className="font-semibold">{value}</span>
    </Card>
  );
};

type DielinesCardData = {
  id: number;
  title: string;
  slug: string;
  count: number;
};

const DielinesCard = ({
  data,
  label,
}: {
  data: DielinesCardData[];
  label: string;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium flex text-muted-foreground">
        <TitleIndicator />
        {label}
      </h3>
      <MostDielinesList data={data} />
    </div>
  );
};
