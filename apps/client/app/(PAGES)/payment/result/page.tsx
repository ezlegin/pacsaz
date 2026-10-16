import PaymentResult from "@/components/PaymentResult";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { ZarinPalStatus } from "@/lib/zarrinpal";
import type { Metadata } from "next";
import React from "react";

interface Props {
  searchParams: Promise<{ Authority: string; Status: ZarinPalStatus }>;
}

const page = async ({ searchParams }: Props) => {
  const { Authority, Status } = await searchParams;

  return <PaymentResult authority={Authority} status={Status} />;
};

export default page;

export const metadata: Metadata = buildMetadata({
  title: "نتیجه پرداخت",
  description: `نتیجه‌ی پرداخت اشتراک ${SITE_NAME}.`,
  path: "/payment/result",
  // Carries a gateway authority in the query string and is disallowed in
  // robots.txt; `noindex` keeps a stale result page out of the index.
  noIndex: true,
});
