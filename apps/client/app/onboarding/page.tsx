import OnboardingForm from "@/components/forms/OnboardingForm";
import { loginPageRoute } from "@/proxy";
import { getSessionUser } from "@repo/auth/session";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await getSessionUser();
  if (!user) redirect(loginPageRoute);
  if (user.onboardingCompleted) redirect("/panel");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      {/* brand wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-[0.10]"
      />

      {/* subtle grid, faded out towards the bottom */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full text-primary"
      >
        <defs>
          <pattern
            id="onboarding-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path d="M28 0H0V28" fill="none" strokeWidth="1" />
          </pattern>
          <radialGradient id="onboarding-fade" cx="50%" cy="15%" r="80%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="url(#onboarding-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#onboarding-grid)"
          className="text-primary/25"
          mask="url(#onboarding-mask)"
        />
      </svg>

      <OnboardingForm phoneNumber={user.phoneNumber} />
    </div>
  );
};

export default page;

export const metadata = {
  title: "تکمیل اطلاعات",
};
