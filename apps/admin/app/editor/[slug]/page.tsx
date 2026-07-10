import DielineEditor from "@/components/DielineEditor/DielineEditor";
import { prisma } from "@repo/db";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

const page = async ({ params }: Props) => {
  const { slug } = await params;

  const dieline = await prisma.dieline.findFirst({
    where: { slug },
    include: {
      settings: true,
      categoryByModel: true,
      categoryByUsage: true,
      _count: true,
    },
  });
  const categories = {
    byModel: await prisma.dielineCategoryByModel.findMany(),
    byUsage: await prisma.dielineCategoryByUsage.findMany(),
  };

  if (!dieline) notFound();

  return <DielineEditor dieline={dieline} categories={categories} />;
};

export default page;
