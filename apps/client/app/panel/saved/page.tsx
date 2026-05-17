import { globalPageSize } from "@repo/lib/data/consts";
import Pagination from "@repo/ui/components/custom/Pagination";
import Search from "@repo/ui/components/custom/Search";
import SavedDielinesList from "./SavedDielinesList";
import { prisma } from "@repo/db";
import { getUserPlan } from "@/data/plan";

const page = async () => {
  const savedDielines = await prisma.savedDieline.findMany({
    where: { userId: 1 },
    include: { settings: true, dieline: true },
  });
  const plan = await getUserPlan(1);

  if (!plan || !plan.isPremium)
    return <div>فقط در اشتراک حرفه ای و سازمانی</div>;
  // todo: sorting
  return (
    <div className="space-y-3">
      <div className="flex">
        <Search placeholder="جستجو..." />
      </div>

      <SavedDielinesList data={savedDielines} plan={plan} />
      <Pagination pageSize={globalPageSize} totalItems={savedDielines.length} />
    </div>
  );
};

export default page;
