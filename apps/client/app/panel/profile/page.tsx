import { ProfileForm } from "@/components/forms/ProfileForm";
import { loginPageRoute } from "@/proxy";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import Card from "@repo/ui/components/custom/Card";
import { redirect } from "next/navigation";

const page = async () => {
  const sessionUser = await getSessionUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser?.id } });

  if (!user) redirect(loginPageRoute);

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <ProfileForm user={user} />
      </Card>
    </div>
  );
};

export default page;

export const metadata = {
  title: "مشخصات",
};
