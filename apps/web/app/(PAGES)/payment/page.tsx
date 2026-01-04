import PaymentGrid from "@/components/PaymentGrid";
import { SubPeriod } from "@/components/SubscriptionList";
import { PlanKey } from "@/data/subscription";

interface Props {
  searchParams: Promise<{ plan: PlanKey; period: SubPeriod }>;
}
const page = async ({ searchParams }: Props) => {
  const { period, plan } = await searchParams;

  return <PaymentGrid query={{ period, plan }} />;
};

export default page;
