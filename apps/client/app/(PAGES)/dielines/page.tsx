import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";
import { prisma } from "@repo/db";

interface Props {
  searchParams: Promise<{ category: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { category } = await searchParams;

  const dielines = await prisma.dieline.findMany({
    orderBy: { id: "desc" },
    where: {
      OR: [
        { categoryByModel: { some: { slug: category } } },
        { categoryByUsage: { some: { slug: category } } },
      ],
    },
    include: { image: true },
  });

  const categoriesByModel = (
    await prisma.dielineCategoryByModel.findMany({ include: { dieline: true } })
  ).filter((c) => c.dieline.length > 0);

  const categoriesByUsage = (
    await prisma.dielineCategoryByUsage.findMany({ include: { dieline: true } })
  ).filter((c) => c.dieline.length > 0);

  return (
    <div className="flex gap-14">
      <div className="w-100">
        <DielinesSidebar
          categoriesByModel={categoriesByModel}
          categoriesByUsage={categoriesByUsage}
        />
      </div>
      <div className="w-full">
        <DielinesGrid dielines={dielines} />
      </div>
    </div>
  );
};

export default page;

export const metadata = {
  title: "قالب ها",
  description:
    "صفحه قالب‌ها در وبسایت پکساز. در این صفحه می‌توانید انواع قالب‌های دایلاین را مشاهده و انتخاب کنید.",
};
