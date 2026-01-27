import { UserType } from "@/components/onboarding/Onboarding";

export function isUserIndividual(userType: UserType) {
  return (
    userType === "designer" || userType === "student" || userType === "other"
  );
}
