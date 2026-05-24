import OnboardingForm from "@/components/forms/OnboardingForm";
import PacsazBGPattern from "@/components/PacsazBGPattern";
import { loginPageRoute } from "@/proxy";
import { getSessionUser } from "@repo/auth/session";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const user = await getSessionUser();
  if (!user) redirect(loginPageRoute);
  if (user.onboardingCompleted) redirect("/panel");

  const phoneNumber = user.phoneNumber;

  return (
    <PacsazBGPattern className="flex justify-center items-center">
      <OnboardingForm phoneNumber={phoneNumber} />
    </PacsazBGPattern>
  );
};

export default page;
