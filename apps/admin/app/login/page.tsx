import { LoginForm } from "@/components/forms/LoginForm";
import { Card, CardContent } from "@repo/ui/components/card";
import PacsazLogo from "@repo/ui/components/custom/PacsazLogo";
import React from "react";

const page = () => {
  return (
    <div className="flex items-center flex-col gap-3">
      <Card>
        <CardContent className="space-y-3">
          <PacsazLogo />
          <div>Please Provide Credentials to log in.</div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
