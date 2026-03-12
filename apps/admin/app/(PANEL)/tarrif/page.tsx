import TarrifForm from "@/components/forms/TarrifForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import React from "react";

const page = async () => {
  const tarrif = await prisma.tarrif.findMany();

  return (
    <div className="space-y-3">
      <PageTitle title="Subscription Tarrif" />
      <TarrifForm tarrif={tarrif} />
    </div>
  );
};

export default page;
