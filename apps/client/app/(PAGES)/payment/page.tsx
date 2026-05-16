import { createPaymentTrack } from "@/actions/payment";
import PaymentCard from "@/components/PaymentCard";
import { prisma } from "@repo/db";
import { PlanKey, PlanPeriod } from "@repo/lib/data/plans";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ plan: PlanKey; period: PlanPeriod }>;
}

const page = async ({ searchParams }: Props) => {
  const { period, plan } = await searchParams;

  if (!plan || !period) redirect("/subscription");

  const tarrif = await prisma.tarrif.findFirst({
    where: { key: plan },
    include: { price: true },
  });
  createPaymentTrack({ period, plan, userId: 1 }); //todo

  if (!tarrif) return <div>Tarrif Doesn't Exist.</div>;

  return <PaymentCard period={period} tarrif={tarrif} />;
};

export default page;
