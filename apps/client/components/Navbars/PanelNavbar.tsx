import { getSessionUser } from "@/data/user";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { LogOut } from "lucide-react";

const PanelNavbar = async () => {
  const user = await getSessionUser();

  return (
    <div className="w-full flex justify-between items-center">
      <div className="border p-2 px-4 rounded-xl text-sm text-muted-foreground flex gap-2 items-center">
        <div
          className={cn(
            user?.plan ? "bg-green-600" : "bg-muted-foreground",
            "size-2  rounded-full",
          )}
        />
        <span>پلن فعال:</span>
        <span>
          {user?.plan ? (
            <span className="font-semibold">{user.plan.title}</span>
          ) : (
            "ندارد"
          )}
        </span>
      </div>

      <Button variant={"ghost"}>
        <LogOut size={20} className="text-destructive/50" />
        <span>خروج از حساب</span>
      </Button>
    </div>
  );
};

export default PanelNavbar;
