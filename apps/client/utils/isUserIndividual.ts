import { UserType } from "@/components/forms/OnboardingForm";

export function isUserIndividual(userType: UserType) {
  return (
    userType === "designer" || userType === "student" || userType === "other"
  );
}
