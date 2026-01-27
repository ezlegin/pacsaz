import Onboarding from "@/components/onboarding/Onboarding";
import PacsazBGPattern from "@/components/PacsazBGPattern";
import React from "react";

const page = () => {
  return (
    <PacsazBGPattern className="flex justify-center items-center">
      <Onboarding />
    </PacsazBGPattern>
  );
};

export default page;
