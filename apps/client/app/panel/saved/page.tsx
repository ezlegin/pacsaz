import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import SavedDielinesList from "./SavedDielinesList";
import { prisma } from "@repo/db";
import { getSessionUser } from "@repo/auth/session";

const page = async () => {
  const user = await getSessionUser();

  const savedDielines = await prisma.savedDieline.findMany({
    where: { userId: user?.id }, //todo
    include: { settings: true, dieline: true },
    orderBy: { id: "desc" },
  });

  if (!user?.plan?.isPremium) return <div>فقط در اشتراک حرفه ای و سازمانی</div>;
  // todo: searching

  return (
    <div className="space-y-3">
      <div className="flex">
        <Search placeholder="جستجو..." />
      </div>

      <SavedDielinesList data={savedDielines} plan={user.plan} />
      <Pagination pageSize={globalPageSize} totalItems={savedDielines.length} />
    </div>
  );
};

export default page;
