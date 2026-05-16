import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";
import { prisma } from "@repo/db";

const page = async () => {
  const dielines = await prisma.dieline.findMany({ orderBy: { id: "desc" } });

  return (
    <div className="flex gap-14">
      <div className="w-100">
        <DielinesSidebar />
      </div>
      <div className="w-full">
        <DielinesGrid dielines={dielines} />
      </div>
    </div>
  );
};

export default page;
