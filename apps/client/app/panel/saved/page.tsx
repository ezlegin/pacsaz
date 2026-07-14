import { getSessionUser } from "@repo/auth/session";
import { prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import { Badge } from "@repo/ui/components/badge";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import SavedDielinesList from "./SavedDielinesList";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { skip, take } = pagination(page, 1);

  const user = await getSessionUser();

  const where = { userId: user?.id };
  const savedDielines = await prisma.savedDieline.findMany({
    where,
    include: { settings: true, dieline: true },
    orderBy: { id: "desc" },
    skip,
    take,
  });

  const totalSavedDielines = await prisma.savedDieline.count({ where });

  if (!user?.plan?.isPremium)
    return <Badge variant={"lightRed"}>فقط در اشتراک حرفه ای و سازمانی</Badge>;
  // todo: searching

  return (
    <div className={"space-y-3"}>
      <div className="flex">
        <Search placeholder="جستجو..." />
      </div>
      <SavedDielinesList data={savedDielines} plan={user!.plan} />
      <Pagination pageSize={1} totalItems={totalSavedDielines} lang="fa" />
    </div>
  );
};

export default page;

export const metadata = {
  title: "ذخیره شده",
};
