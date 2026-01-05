import { mapUserPlanTitle, testUser } from "@/data/user";
import { isSubscribed } from "@/lib/dielines/core/consts";
import Diamond from "@/public/icons/Diamond";
import { calculateRemaningSubscription } from "@/utils/calculateRemaningSubscriptoin";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { User } from "lucide-react";
import Link from "next/link";

const NavbarButtons = () => {
  const remainingDays = calculateRemaningSubscription();
  const isCloseToExpiry = remainingDays < 7;

  return (
    <div className="flex gap-3 items-center">
      {isSubscribed ? (
        <Badge
          className="p-2 px-4"
          variant={
            !isSubscribed
              ? "lightRed"
              : isCloseToExpiry
                ? "lightYellow"
                : "lightGreen"
          }
        >
          {isCloseToExpiry ? (
            `تمدید اشتراک در ${remainingDays} روز `
          ) : (
            <span> پلن: {mapUserPlanTitle(testUser.plan.key)}</span>
          )}
        </Badge>
      ) : (
        <Link href={"/panel"}>
          <Button variant={"ghost"}>
            <Diamond />
            اشتراک
          </Button>
        </Link>
      )}

      <div>
        <div className="w-[1px] ml-3 h-6 bg-slate-300" />
      </div>
      <Link href={isSubscribed ? "/panel" : "/login"}>
        <Button variant={isSubscribed ? "outline" : "default"}>
          {isSubscribed ? (
            <div className="flex items-center gap-1.5">
              <User />
              {testUser.fullName}
            </div>
          ) : (
            "حساب کاربری"
          )}
        </Button>
      </Link>
    </div>
  );
};

export default NavbarButtons;
