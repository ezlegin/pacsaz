"use client";

import { useState } from "react";
import { InputForm } from "./InputForm";
import { OTPForm } from "./OTPForm";

export type LoginStep = "input" | "otp";

const LoginForm = () => {
  const [loginStep, setLoginStep] = useState<LoginStep>("input");

  return (
    <>
      {loginStep === "input" && <InputForm setLoginStep={setLoginStep} />}
      {loginStep === "otp" && <OTPForm setLoginStep={setLoginStep} />}
    </>
  );
};

export default LoginForm;
