import DielinesGrid from "@/components/DielinesGrid";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import { Frown } from "lucide-react";
import Link from "next/link";

const page = async () => {
  const user = await getSessionUser();
  const favs = await prisma.favedDieline.findMany({
    where: { userId: user?.id },
    include: { dieline: true },
  });

  const dielines = favs.map((f) => f.dieline);

  if (dielines.length === 0)
    return (
      <Card className="flex flex-col gap-3 justify-center items-center text-muted-foreground">
        <Frown size={80} strokeWidth={1.5} className="text-gray-400" />
        <p>هیچ قالبی به لیست علاقه مندی ها اضافه نکرده اید,</p>
        <Link href={"/dielines"}>
          <Button>مشاهده قالب ها</Button>
        </Link>
      </Card>
    );

  return (
    <div>
      <DielinesGrid dielines={dielines} />
    </div>
  );
};

export default page;
