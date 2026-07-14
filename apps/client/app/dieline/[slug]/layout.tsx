import DielineNavbar from "@/components/Navbars/DielineNavbar";
import PacsazLogo from "@/components/PacsazLogo";
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
    <div className="bg-accent flex flex-col h-screen overflow-hidden relative">
      <div className="absolute bg-primary-foreground top-0 right-0 z-50 w-full h-full flex justify-center items-center lg:hidden">
        <div className="flex flex-col items-center gap-3 ">
          <PacsazLogo type="full" scale={1.4} />
          برای استفاده از محیط ادیتور با یک <strong>صفحه نمایش بزرگتر</strong>
          وارد شوید.
        </div>
      </div>
      <DielineNavbar dieline={dieline} />
      {children}
    </div>
  );
}
