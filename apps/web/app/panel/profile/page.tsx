import Card from "@repo/ui/components/custom/Card";
import { ProfileForm } from "@/components/forms/ProfileForm";
import React from "react";

const page = () => {
  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <ProfileForm />
      </Card>
    </div>
  );
};

export default page;
