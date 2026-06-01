import PaymentResult from "@/components/PaymentResult";
import { ZarinPalStatus } from "@/lib/zarrinpal";
import React from "react";

interface Props {
  searchParams: Promise<{ Authority: string; Status: ZarinPalStatus }>;
}

const page = async ({ searchParams }: Props) => {
  const { Authority, Status } = await searchParams;

  return <PaymentResult authority={Authority} status={Status} />;
};

export default page;

export const metadata = {
  title: "نتیجه پرداخت",
};
