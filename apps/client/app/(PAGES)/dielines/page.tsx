import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";
import { Prisma, prisma } from "@repo/db";
import { pagination } from "@repo/lib/utils/pagination";
import { Button } from "@repo/ui/components/button";
import Pagination from "@repo/ui/components/custom/Pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Filter } from "lucide-react";

interface Props {
  searchParams: Promise<{ category: string; page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { category, page } = await searchParams;
  const pageSize = 32;
  const { skip, take } = pagination(page, pageSize);

  const where: Prisma.DielineWhereInput = {
    OR: [
      { categoryByModel: { some: { slug: category } } },
      { categoryByUsage: { some: { slug: category } } },
    ],
  };

  const dielines = await prisma.dieline.findMany({
    orderBy: { id: "desc" },
    where,
    include: { dielineImage: true, modelImage: true },
    skip,
    take,
  });
  const totalDielines = await prisma.dieline.count({ where });

  const categoriesByModel = (
    await prisma.dielineCategoryByModel.findMany({ include: { dieline: true } })
  ).filter((c) => c.dieline.length > 0);

  const categoriesByUsage = (
    await prisma.dielineCategoryByUsage.findMany({ include: { dieline: true } })
  ).filter((c) => c.dieline.length > 0);

  return (
    <div className="md:flex gap-14">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"ghost"}>
              <Filter />
              فیلتر جستجو
            </Button>
          </SheetTrigger>
          <SheetContent showCloseButton={false}>
            <SheetHeader className="space-y-2">
              <SheetTitle>فیلتر کردن جستجو</SheetTitle>
              <SheetDescription></SheetDescription>
              <DielinesSidebar
                categoriesByModel={categoriesByModel}
                categoriesByUsage={categoriesByUsage}
              />
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-100 hidden md:block">
        <DielinesSidebar
          categoriesByModel={categoriesByModel}
          categoriesByUsage={categoriesByUsage}
        />
      </div>

      <div className="w-full space-y-4">
        <DielinesGrid dielines={dielines} />
        <Pagination pageSize={pageSize} totalItems={totalDielines} lang="fa" />
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
