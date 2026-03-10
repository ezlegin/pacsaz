import DielineEditor from "@/components/DielineEditor/DielineEditor";
import { prisma } from "@repo/db";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

const page = async ({ params }: Props) => {
  const { slug } = await params;

  const dieline = await prisma.dieline.findFirst({
    where: { slug },
    include: {
      settings: {
        include: {
          defaultDimension: true,
          minDimension: true,
        },
      },
    },
  });

  if (!dieline) notFound();

  return <DielineEditor dieline={dieline} />;
};

export default page;
