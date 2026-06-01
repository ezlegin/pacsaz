import { createPaymentTrack } from "@/actions/payment";
import PaymentCard from "@/components/PaymentCard";
import { PlanKey, PlanPeriod, prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { getSessionUser } from "@repo/auth/session";
import { loginPageRoute } from "@/proxy";

interface Props {
  searchParams: Promise<{ plan: PlanKey; period: PlanPeriod }>;
}

const page = async ({ searchParams }: Props) => {
  const user = await getSessionUser();
  if (!user) redirect(loginPageRoute);

  const { period, plan } = await searchParams;

  if (!plan || !period) redirect("/subscription");

  const tarrif = await prisma.tarrif.findFirst({
    where: { key: plan },
    include: { price: true },
  });
  createPaymentTrack({ period, plan, userId: user.id }); //todo

  if (!tarrif) return <div>Tarrif Doesn't Exist.</div>;

  return <PaymentCard period={period} tarrif={tarrif} />;
};

export default page;

export const metadata = {
  title: "پرداخت",
};
