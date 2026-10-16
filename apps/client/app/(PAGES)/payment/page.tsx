import { createPaymentTrack } from "@/actions/payment";
import PaymentCard from "@/components/PaymentCard";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { PlanKey, PlanPeriod, prisma } from "@repo/db";
import type { Metadata } from "next";
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

export const metadata: Metadata = buildMetadata({
  title: "پرداخت اشتراک",
  description: `تکمیل پرداخت اشتراک ${SITE_NAME} از طریق درگاه بانکی امن.`,
  path: "/payment",
  // Per-visitor checkout: reachable without a session, but never indexable.
  // Kept out of `sitemap.ts` by `NON_SITEMAP_PATHS`.
  noIndex: true,
});
