"use client";

import { cn } from "@repo/ui/lib/utils";
import { ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { InputForm } from "./InputForm";
import { OTPForm } from "./OTPForm";

export type LoginStep = "input" | "otp";

const STEPS = [
  { id: "input", label: "شماره تماس", icon: Smartphone },
  { id: "otp", label: "کد تایید", icon: ShieldCheck },
] as const;

const LoginForm = () => {
  const [loginStep, setLoginStep] = useState<LoginStep>("input");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const activeIndex = STEPS.findIndex((s) => s.id === loginStep);

  return (
    <div className="flex flex-1 flex-col">
      {/* ----------------------------- step rail ----------------------------- */}
      <ol className="mb-7 flex items-center gap-2">
        {STEPS.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-xl transition-all duration-300",
                  active
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-primary/25"
                    : done
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" strokeWidth={2} />
              </span>

              <span
                className={cn(
                  "truncate text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>

              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1 rounded-full transition-colors duration-500",
                    done ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ------------------------------- panels ------------------------------ */}
      {loginStep === "input" ? (
        <InputForm
          setLoginStep={setLoginStep}
          setPhoneNumber={setPhoneNumber}
        />
      ) : (
        <OTPForm setLoginStep={setLoginStep} phoneNumber={phoneNumber} />
      )}
    </div>
  );
};

export default LoginForm;
