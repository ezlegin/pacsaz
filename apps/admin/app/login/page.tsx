import { LoginForm } from "@/components/forms/LoginForm";
import PacsazLogo from "@/components/PacsazLogo";
import { getCurrentAdmin } from "@/lib/session";
import { Card, CardContent } from "@repo/ui/components/card";
import { redirect } from "next/navigation";

const page = async () => {
  // The proxy no longer bounces signed-in admins off /login (see proxy.ts), so a
  // live session is sent to the dashboard here, where the admin row is checked.
  if (await getCurrentAdmin()) redirect("/");

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardContent className="space-y-6 py-2">
        <div className="flex flex-col items-center gap-3 text-center">
          <PacsazLogo type="full" scale={1.3} />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Admin panel</h1>
            <p className="text-sm text-muted-foreground">Sign in with your staff account.</p>
          </div>
        </div>
        <LoginForm />
      </CardContent>
    </Card>
  );
};

export default page;
