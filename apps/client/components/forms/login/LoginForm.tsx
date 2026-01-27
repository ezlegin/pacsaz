"use client";

import { useState } from "react";
import { InputForm } from "./InputForm";
import { OTPForm } from "./OTPForm";

export type LoginStep = "input" | "otp";

const LoginForm = () => {
  const [loginStep, setLoginStep] = useState<LoginStep>("input");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  return (
    <>
      {loginStep === "input" && (
        <InputForm
          setLoginStep={setLoginStep}
          setPhoneNumber={setPhoneNumber}
        />
      )}
      {loginStep === "otp" && (
        <OTPForm setLoginStep={setLoginStep} phoneNumber={phoneNumber} />
      )}
    </>
  );
};

export default LoginForm;
