import { getSessionUser } from "@repo/auth/session";
import Diamond from "@/public/icons/Diamond";
import { calculateRemaningSubscription } from "@/utils/calculateRemaningSubscriptoin";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { User } from "lucide-react";
import Link from "next/link";

const NavbarButtons = async () => {
  const user = await getSessionUser();

  const remainingDays = user?.plan
    ? calculateRemaningSubscription(user.plan)
    : 0;
  const isCloseToExpiry = remainingDays < 7;

  return (
    <div className="flex gap-3 items-center">
      {user?.plan ? (
        <Badge
          className="p-2 px-4"
          variant={isCloseToExpiry ? "lightYellow" : "lightGreen"}
        >
          {isCloseToExpiry ? (
            `تمدید اشتراک در ${remainingDays} روز `
          ) : (
            <span> پلن: {user.plan.title}</span>
          )}
        </Badge>
      ) : (
        <Link href={user ? "/panel" : "/subscription"}>
          <Button variant={"ghost"}>
            <Diamond />
            اشتراک
          </Button>
        </Link>
      )}

      <div>
        <div className="w-px ml-3 h-6 bg-slate-300" />
      </div>
      <Link href={"/panel"}>
        <Button variant={user ? "outline" : "default"}>
          {user ? (
            <div className="flex items-center gap-1.5">
              <User />
              {user.fullName}
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
