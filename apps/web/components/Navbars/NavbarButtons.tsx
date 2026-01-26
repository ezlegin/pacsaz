import Diamond from "@/public/icons/Diamond";
import { calculateRemaningSubscription } from "@/utils/calculateRemaningSubscriptoin";
import { sessionUser } from "@repo/store/app/user.store";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { User } from "lucide-react";
import Link from "next/link";

const NavbarButtons = () => {
  const remainingDays = calculateRemaningSubscription();
  const isCloseToExpiry = (remainingDays ?? 0) < 7;

  return (
    <div className="flex gap-3 items-center">
      {sessionUser?.plan ? (
        <Badge
          className="p-2 px-4"
          variant={
            !sessionUser.plan
              ? "lightRed"
              : isCloseToExpiry
                ? "lightYellow"
                : "lightGreen"
          }
        >
          {isCloseToExpiry ? (
            `تمدید اشتراک در ${remainingDays} روز `
          ) : (
            <span> پلن: {sessionUser.plan.title}</span>
          )}
        </Badge>
      ) : (
        <Link
          href={
            sessionUser?.plan ? "#" : sessionUser ? "/panel" : "/subscription"
          }
        >
          <Button variant={"ghost"}>
            <Diamond />
            اشتراک
          </Button>
        </Link>
      )}

      <div>
        <div className="w-px ml-3 h-6 bg-slate-300" />
      </div>
      <Link href={sessionUser ? "/panel" : "/login"}>
        <Button variant={sessionUser ? "outline" : "default"}>
          {sessionUser ? (
            <div className="flex items-center gap-1.5">
              <User />
              {sessionUser.fullName}
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
