import { PaymentForm } from "@/components/forms/PaymentForm";
import PageTitle from "@/components/PageTitle";
import BackButton from "@repo/ui/components/custom/BackButton";
import React from "react";

const page = () => {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <BackButton />
        <PageTitle title="New Payment" />
      </div>

      <PaymentForm />
    </div>
  );
};

export default page;
