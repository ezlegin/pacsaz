import { testUser } from "@/data/user";
import { isSubscribed } from "@/lib/dielines/core/consts";
import Diamond from "@/public/icons/Diamond";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";

const NavbarButtons = () => {
  const remainedDownloads = 38;

  return (
    <div className="flex gap-3 items-center">
      <Link href={isSubscribed ? "#" : "/subscription"}>
        <Button variant={"ghost"}>
          {isSubscribed ? (
            <div
              className={cn(
                remainedDownloads <= 10 ? "text-red-500" : "text-green-600",
                "flex gap-2 items-center"
              )}
            >
              <Diamond />
              {remainedDownloads} دانلود
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Diamond />
              اشتراک
            </div>
          )}
        </Button>
      </Link>

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
