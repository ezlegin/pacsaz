import { PlanPeriod } from "@repo/db";
import { addMonths } from "date-fns";

export const calculatePlanEndDate = (period: PlanPeriod) => {
  switch (period) {
    case "monthly":
      return addMonths(new Date(), 1);
    case "threeMonth":
      return addMonths(new Date(), 3);
    case "annual":
      return addMonths(new Date(), 12);
  }
};
