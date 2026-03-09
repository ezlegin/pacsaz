import ProductNavbar from "@/components/Navbars/ProductNavbar";
import { prisma } from "@repo/db";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dieline = await prisma.dieline.findFirst({ where: { slug } });

  if (!dieline) return notFound();

  return (
    <div className="bg-accent flex flex-col h-screen overflow-hidden">
      <ProductNavbar productName={dieline.title} />
      {children}
    </div>
  );
}
