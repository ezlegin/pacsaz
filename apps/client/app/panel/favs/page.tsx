import DielinesGrid from "@/components/DielinesGrid";
import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import Pagination from "@repo/ui/components/custom/Pagination";
import { Frown } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const pageSize = 40;

  const { skip, take } = pagination(page, pageSize);

  const user = await getSessionUser();
  const where = { userId: user?.id };
  const favs = await prisma.favedDieline.findMany({
    where,
    include: { dieline: true },
    skip,
    take,
  });

  const totalFavs = await prisma.favedDieline.count({ where });

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
    <div className="space-y-4">
      <DielinesGrid dielines={dielines} />
      <Pagination pageSize={pageSize} totalItems={totalFavs} />
    </div>
  );
};

export default page;

export const metadata = {
  title: "علاقه مندی ها",
};
