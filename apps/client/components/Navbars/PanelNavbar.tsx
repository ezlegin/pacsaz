import { getSessionUser } from "@repo/auth/session";
import { cn } from "@repo/ui/lib/utils";
import LogoutButton from "../LogoutButton";

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

      <LogoutButton />
    </div>
  );
};

export default PanelNavbar;
