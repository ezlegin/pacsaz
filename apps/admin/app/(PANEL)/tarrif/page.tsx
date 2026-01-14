import TarrifForm from "@/components/forms/TarrifForm";
import PageTitle from "@/components/PageTitle";
import React from "react";

const page = () => {
  return (
    <div className="space-y-3 max-w-sm">
      <PageTitle title="Subscription Tarrif" />
      <TarrifForm />
    </div>
  );
};

export default page;
