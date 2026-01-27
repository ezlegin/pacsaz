import PaymentGrid from "@/components/PaymentGrid";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";

interface Props {
  searchParams: Promise<{ plan: PlanKey; period: PlanPeriod }>;
}
const page = async ({ searchParams }: Props) => {
  const { period, plan } = await searchParams;

  return <PaymentGrid query={{ period, plan }} />;
};

export default page;
