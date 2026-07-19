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
    active: true,
    OR: [
      { categoryByModel: { some: { slug: category } } },
      { categoryByUsage: { some: { slug: category } } },
    ],
  };

  const dielines = await prisma.dieline.findMany({
    orderBy: { id: "desc" },
    where,
    include: {
      dielineImage: true,
      modelImage: true,
      categoryByModel: true,
      categoryByUsage: true,
    },
    skip,
    take,
  });
  const totalDielines = await prisma.dieline.count({ where });

  const include = {
    _count: {
      select: {
        dieline: {
          where: { active: true },
        },
      },
    },
  };
  const categoriesByModel = await prisma.dielineCategoryByModel.findMany({
    include,
  });

  const categoriesByUsage = await prisma.dielineCategoryByUsage.findMany({
    include,
  });

  const filteredCategoriesByModel = categoriesByModel.filter(
    (c) => c._count.dieline > 0,
  );

  const filteredCategoriesByUsage = categoriesByUsage.filter(
    (c) => c._count.dieline > 0,
  );

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
                categoriesByModel={filteredCategoriesByModel}
                categoriesByUsage={filteredCategoriesByUsage}
              />
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-100 hidden md:block">
        <DielinesSidebar
          categoriesByModel={filteredCategoriesByModel}
          categoriesByUsage={filteredCategoriesByUsage}
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
