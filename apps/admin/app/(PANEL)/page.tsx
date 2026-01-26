import PageTitle from "@/components/PageTitle";
import Card from "@repo/ui/components/custom/Card";
import TitleIndicator from "@/components/TitleIndicator";
import MostDielinesList from "@/components/MostDielinesList";
import { formatPrice } from "@repo/lib/utils/formatPrice";

const page = () => {
  const subscriptionsData = [
    { label: "Active", value: 123, primaryTheme: true },
    { label: "Monthly", value: 12 },
    { label: "3-month", value: 8 },
    { label: "Annual", value: 76 },
    { label: "Near To End", value: 14 },
    { label: "Returning", value: 12 },
    { label: "Faithful Users", value: 14 },
    { label: "Lost Users", value: 14 },
  ];

  const revenueData = [
    { label: "This Month", value: formatPrice(123), primaryTheme: true },
    { label: "Last Month", value: formatPrice(123) },
    { label: "This Season", value: formatPrice(123) },
    { label: "This Year", value: formatPrice(123) },
  ];

  const DielinesData = [
    { label: "Most Downloaded", data },
    { label: "Most Viewd", data },
    { label: "Most Faved", data },
    { label: "Most Saved", data },
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

const data = [
  {
    id: 1,
    title: "جعبه دو طرف درب",
    slug: "tuck-end",
    count: 123,
  },
  {
    id: 2,
    title: "جعبه اسنپ لاک",
    slug: "tuck-end-snap-lock",
    count: 123,
  },
  {
    id: 3,
    title: "جعبه دو طرف درب",
    slug: "tuck-end",
    count: 123,
  },
  {
    id: 4,
    title: "جعبه اسنپ لاک",
    slug: "tuck-end-snap-lock",
    count: 123,
  },
  {
    id: 5,
    title: "جعبه اسنپ لاک",
    slug: "tuck-end-snap-lock",
    count: 123,
  },
];

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
