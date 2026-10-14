import { UserType } from "@repo/lib/data/types";

export function isUserIndividual(userType: UserType) {
  return (
    userType === "designer" || userType === "student" || userType === "other"
  );
}
