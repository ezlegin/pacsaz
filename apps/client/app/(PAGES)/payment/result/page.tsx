import PaymentResult from "@/components/PaymentResult";
import React from "react";

interface Props {
  searchParams: Promise<{ authority: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { authority } = await searchParams;

  return <PaymentResult authority={authority} />;
};

export default page;
