import PaymentGrid from "@/components/PaymentGrid";
import { prisma } from "@repo/db";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";
import Card from "@repo/ui/components/custom/Card";

interface Props {
  searchParams: Promise<{ plan: PlanKey; period: PlanPeriod }>;
}

const page = async ({ searchParams }: Props) => {
  const { period, plan } = await searchParams;

  if (!plan || !period)
    return <Card className="text-center">Error loading tarrif.</Card>;

  const tarrif = await prisma.tarrif.findFirst({
    where: { key: plan },
    include: { price: true },
  });

  if (!tarrif) return <div>Tarrif Doesn't Exist.</div>;

  return <PaymentGrid period={period} tarrif={tarrif} />;
};

export default page;
