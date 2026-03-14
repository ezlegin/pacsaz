import DielinesGrid from "@/components/DielinesGrid";
import { prisma } from "@repo/db";

const page = async () => {
  const favs = await prisma.favedDieline.findMany({
    where: { userId: 1 },
    include: { dieline: true },
  });

  const dielines = favs.map((f) => f.dieline);

  return (
    <div>
      <DielinesGrid dielines={dielines} />
    </div>
  );
};

export default page;
