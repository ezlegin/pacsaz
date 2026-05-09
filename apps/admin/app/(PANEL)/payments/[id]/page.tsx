import { PaymentForm } from "@/components/forms/PaymentForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import BackButton from "@repo/ui/components/custom/BackButton";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: Props) => {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: +id },
    include: { plan: true, user: true },
  });
  const tarrif = await prisma.tarrif.findMany({ include: { price: true } });

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <BackButton />
        <PageTitle title="Update Payment" />
      </div>

      <PaymentForm tarrif={tarrif} payment={payment} />
    </div>
  );
};

export default page;
